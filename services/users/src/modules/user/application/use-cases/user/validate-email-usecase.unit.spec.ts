import { EmailConstants } from '@user/domain/values-objects/user/constants';
import { ValidateEmailUseCase } from './validate-email-usecase';
import EmailCodeRepository from '@user/domain/ports/secondary/email-code-repository.port';
import { EmailSender } from '@user/domain/ports/secondary/mail-sender.port';
import { TokenService } from '@user/domain/ports/secondary/token-service.port';
import { OtpGenerator } from '@user/domain/ports/secondary/otp-generator.port';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

describe('ValidateEmailUseCase', () => {
  let useCase: ValidateEmailUseCase;

  let emailSender: EmailSender;
  let emailCodeRepository: EmailCodeRepository;
  let configService: ConfigService<EnvironmentVariables>;
  let tokenService: TokenService;
  let otpGenerator: OtpGenerator;

  beforeEach(async () => {
    emailSender = {
      send: vi.fn(),
    } as any;

    emailCodeRepository = {
      save: vi.fn(),
      exists: vi.fn(),
      deleteMany: vi.fn(),
    } as any;

    configService = {
      get: vi.fn(),
    } as any;

    tokenService = {
      generateSignUpToken: vi.fn(),
    } as any;

    otpGenerator = {
      generate: vi.fn(),
    } as any;

    useCase = new ValidateEmailUseCase(
      emailSender,
      emailCodeRepository,
      configService,
      tokenService,
      otpGenerator,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(emailSender).toBeDefined();
    expect(emailCodeRepository).toBeDefined();
    expect(configService).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  describe('sendEmail', () => {
    const email = EmailConstants.EXEMPLE;
    const emailFrom = `teste.${EmailConstants.EXEMPLE}`;
    const OTPCode = 'AAAAAA';

    beforeEach(() => {
      vi.spyOn(otpGenerator, 'generate').mockReturnValue(OTPCode);
      vi.spyOn(configService, 'get').mockReturnValue(emailFrom);
    });

    it('should return ok on sucess', async () => {
      const result = await useCase.sendEmail(email);
      expect(result).toEqual({ ok: true });
    });

    it('should call otpGenerator.generate with correct parameters', async () => {
      await useCase.sendEmail(email);
      expect(otpGenerator.generate).toHaveBeenCalledWith();
    });

    it('should call configService.get with correct parameters', async () => {
      await useCase.sendEmail(email);
      expect(configService.get).toHaveBeenCalledWith(
        'EMAIL_FROM_FOR_VALIDATE_EMAIL',
      );
    });

    it('should call emailSender.send with correct parameters', async () => {
      await useCase.sendEmail(email);
      expect(emailSender.send).toHaveBeenCalledWith(
        email,
        configService.get<string>('EMAIL_FROM_FOR_VALIDATE_EMAIL'),
        'Seu Código de Validação',
        'validate-email',
        {
          code: OTPCode,
        },
      );
    });

    it('should call emailCodeRepository.save with correct parameters', async () => {
      await useCase.sendEmail(email);
      expect(emailCodeRepository.save).toHaveBeenCalledWith(email, OTPCode);
    });

    it('should return NOT_POSSIBLE if emailSender throw error', async () => {
      vi.spyOn(emailSender, 'send').mockRejectedValue(
        new Error('Error sending email'),
      );

      const result = await useCase.sendEmail(email);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel enviar o código de validação.',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE if codeRepository throw error', async () => {
      vi.spyOn(emailCodeRepository, 'save').mockRejectedValue(
        new Error('Error saving code'),
      );

      const result = await useCase.sendEmail(email);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel enviar o código de validação.',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });

  describe('sendEmavalidateCodeil', () => {
    const email = EmailConstants.EXEMPLE;
    const OTPCode = 'AAAAAA';
    const token = 'TOIKEN';

    beforeEach(() => {
      vi.spyOn(emailCodeRepository, 'exists').mockResolvedValue(true);
      vi.spyOn(tokenService, 'generateSignUpToken').mockReturnValue(token);
    });

    it('should call emailCodeRepository.exists with correct parameters', async () => {
      await useCase.validateCode(OTPCode, email);
      expect(emailCodeRepository.exists).toHaveBeenCalledWith(email, OTPCode);
    });

    it('should call emailCodeRepository.deleteMany with correct parameters', async () => {
      await useCase.validateCode(OTPCode, email);
      expect(emailCodeRepository.deleteMany).toHaveBeenCalledWith(email);
    });

    it('should call tokenService.generateSignUpToken with correct parameters', async () => {
      await useCase.validateCode(OTPCode, email);
      expect(tokenService.generateSignUpToken).toHaveBeenCalledWith({ email });
    });

    it('should return ok and signup token on sucess', async () => {
      const result = await useCase.validateCode(OTPCode, email);
      expect(result).toEqual({ ok: true, result: token });
    });

    it('should return BUSINESS_RULE_FAILURE and ok false on not find email and code in database', async () => {
      vi.spyOn(emailCodeRepository, 'exists').mockResolvedValue(false);

      const result = await useCase.validateCode(OTPCode, email);
      expect(result).toEqual({
        ok: false,
        message: 'Código de validação inválido ou expirado. Tente novamente',
        reason: ApplicationResultReasons.BUSINESS_RULE_FAILURE,
      });
    });

    it('should return NOT_POSSIBLE if emailCodeRepository.exists throw error', async () => {
      vi.spyOn(emailCodeRepository, 'exists').mockRejectedValue(
        new Error('Error'),
      );

      const result = await useCase.validateCode(OTPCode, email);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel validar o código de verificação.',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE if emailCodeRepository.deleteMany throw error', async () => {
      vi.spyOn(emailCodeRepository, 'exists').mockResolvedValue(true);
      vi.spyOn(emailCodeRepository, 'deleteMany').mockRejectedValue(
        new Error('Error'),
      );

      const result = await useCase.validateCode(OTPCode, email);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel validar o código de verificação.',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE if tokenService throw error', async () => {
      vi.spyOn(tokenService, 'generateSignUpToken').mockImplementation(() => {
        throw new Error('Error');
      });

      const result = await useCase.validateCode(OTPCode, email);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel validar o código de verificação.',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
