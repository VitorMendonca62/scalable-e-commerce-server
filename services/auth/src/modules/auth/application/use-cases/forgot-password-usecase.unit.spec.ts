vi.mock('otp-generator', () => {
  return { generate: vi.fn() };
});

import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import EmailCodeRepository from '@auth/domain/ports/secondary/email-code-repository.port';
import { EmailConstants } from '@auth/domain/values-objects/constants';
import { EmailCodeModelFactory } from '@auth/infrastructure/helpers/tests/email-code-factory';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import ForgotPasswordUseCase from './forgot-password.usecase';
import * as otpGenerator from 'otp-generator';
import { type Mock } from 'vitest';
import { EmailSender } from '@auth/domain/ports/secondary/mail-sender.port';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;

  let emailCodeRepository: EmailCodeRepository;
  let tokenService: TokenService;
  let emailSender: EmailSender;
  let configService: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    emailCodeRepository = {
      save: vi.fn(),
      findOne: vi.fn(),
      deleteMany: vi.fn(),
    } as any;

    tokenService = {
      generateResetPassToken: vi.fn(),
      verifyResetPassToken: vi.fn(),
    } as any;

    emailSender = {
      send: vi.fn(),
    } as any;

    configService = {
      get: vi.fn(),
    } as any;

    useCase = new ForgotPasswordUseCase(
      emailCodeRepository,
      tokenService,
      emailSender,
      configService,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(emailCodeRepository).toBeDefined();
    expect(emailSender).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('sendCode', () => {
    const email = EmailConstants.EXEMPLE;
    const emailFrom = `teste.${EmailConstants.EXEMPLE}`;
    const OTPCode = 'AAAAAA';

    beforeEach(() => {
      (otpGenerator.generate as Mock).mockReturnValue(OTPCode);
      vi.spyOn(configService, 'get').mockReturnValue(emailFrom);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-01T16:00:00.000Z'));
    });

    it('should call otpGenerator.generate with correct parameters', async () => {
      await useCase.sendCode(email);
      expect(otpGenerator.generate).toHaveBeenCalledWith(6, {
        upperCaseAlphabets: true,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
      });
    });

    it('should call configService.get with correct parameters', async () => {
      await useCase.sendCode(email);
      expect(configService.get).toHaveBeenCalledWith(
        'EMAIL_FROM_FOR_FORGOT_PASSWORD',
      );
    });

    it('should call emailSender.send with correct parameters', async () => {
      await useCase.sendCode(email);
      expect(emailSender.send).toHaveBeenCalledWith(
        email,
        emailFrom,
        'Seu Código de recuperação',
        'forgot-password-email',
        {
          code: OTPCode,
        },
      );
    });

    it('should call emailCodeRepository.save with correct parameters', async () => {
      await useCase.sendCode(email);
      const expiresIn = new Date().getTime() + 1000 * 60 * 10;
      expect(emailCodeRepository.save).toHaveBeenCalledWith({
        email,
        code: OTPCode,
        expiresIn: new Date(expiresIn),
      });
    });

    it('should return NOT_POSSIBLE when emailSender throws error', async () => {
      vi.spyOn(emailSender, 'send').mockRejectedValue(
        new Error('Error sending email'),
      );

      const result = await useCase.sendCode(email);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      });
    });

    it('should return NOT_POSSIBLE when emailCodeRepository throws error', async () => {
      vi.spyOn(emailCodeRepository, 'save').mockRejectedValue(
        new Error('Error saving code'),
      );

      const result = await useCase.sendCode(email);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      });
    });
  });

  describe('validateCode', () => {
    const email = EmailConstants.EXEMPLE;
    const code = 'AAAAAA';

    beforeEach(() => {
      vi.spyOn(emailCodeRepository, 'findOne').mockResolvedValue(
        EmailCodeModelFactory.createModel(),
      );

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-01T16:00:00.000Z'));
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should return reset pass token', async () => {
      const token = 'RESET-PASS-TOKEN';
      vi.spyOn(tokenService, 'generateResetPassToken').mockResolvedValue(token);

      const result = await useCase.validateCode(code, email);
      expect(result).toEqual({ ok: true, result: token });
    });

    it('should call emailCodeRepository.find with email and code', async () => {
      await useCase.validateCode(code, email);
      expect(emailCodeRepository.findOne).toHaveBeenCalledWith({ code, email });
    });

    it('should return field invalid reason and ok is false when no have document with code and email', async () => {
      vi.spyOn(emailCodeRepository, 'findOne').mockResolvedValue(undefined);

      const result = await useCase.validateCode(code, email);
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.FIELD_INVALID,
        message: 'Código de recuperação inválido ou expirado. Tente novamente',
      });
    });

    it('should return field invalid when the code expired', async () => {
      vi.spyOn(emailCodeRepository, 'findOne').mockResolvedValue(
        EmailCodeModelFactory.createModel({
          expiresIn: new Date('2024-01-01T10:10:00z'),
        }),
      );

      const result = await useCase.validateCode(code, email);
      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.FIELD_INVALID,
        message: 'Código de recuperação inválido ou expirado. Tente novamente',
      });
    });

    it('should call emailCodeRepository.deleteMany with correct parameters', async () => {
      await useCase.validateCode(code, email);

      expect(emailCodeRepository.deleteMany).toHaveBeenCalledWith(email);
    });

    it('should call tokenService.generateResetPassToken with correct parameters', async () => {
      await useCase.validateCode(code, email);

      expect(tokenService.generateResetPassToken).toHaveBeenCalledWith({
        email,
      });
    });

    it('should return NOT_POSSIBLE when emailCodeRepository.find throws error', async () => {
      vi.spyOn(emailCodeRepository, 'findOne').mockRejectedValue(
        new Error('Error finding email code row'),
      );

      const result = await useCase.validateCode(code, email);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      });
    });

    it('should return NOT_POSSIBLE when emailCodeRepository.deleteMany throws error', async () => {
      vi.spyOn(emailCodeRepository, 'deleteMany').mockRejectedValue(
        new Error('Error deleting code'),
      );

      const result = await useCase.validateCode(code, email);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      });
    });

    it('should return NOT_POSSIBLE when tokenService throws error', async () => {
      vi.spyOn(tokenService, 'generateResetPassToken').mockImplementation(
        () => {
          throw new Error('Error generate reset pass token');
        },
      );

      const result = await useCase.validateCode(code, email);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      });
    });
  });
});
