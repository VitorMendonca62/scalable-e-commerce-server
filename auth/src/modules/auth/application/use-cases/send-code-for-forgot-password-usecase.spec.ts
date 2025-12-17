import * as otpGenerator from 'otp-generator';
import SendCodeForForgotPasswordUseCase from './send-code-for-forgot-password.usecase';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import EmailCodeRepository from '@auth/domain/ports/secondary/code-repository.port';
import { EmailSender } from '@auth/domain/ports/secondary/mail-sender.port';

describe('GetAccessTokenUseCase', () => {
  let useCase: SendCodeForForgotPasswordUseCase;

  let emailSender: EmailSender;
  let codeRepository: EmailCodeRepository;
  let configService: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    emailSender = {
      send: jest.fn(),
    } as any;

    codeRepository = {
      save: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    useCase = new SendCodeForForgotPasswordUseCase(
      emailSender,
      codeRepository,
      configService,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(emailSender).toBeDefined();
    expect(codeRepository).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('execute', () => {
    const email = EmailConstants.EXEMPLE;
    const emailFrom = `teste.${EmailConstants.EXEMPLE}`;
    const OTPCode = 'AAAAAA';

    beforeEach(() => {
      jest.spyOn(otpGenerator, 'generate').mockReturnValue(OTPCode);
      jest.spyOn(configService, 'get').mockReturnValue(emailFrom);

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T10:00:00z'));
    });

    it('should call otpGenerator.generate with correct parameters', async () => {
      await useCase.execute(email);
      expect(otpGenerator.generate).toHaveBeenCalledWith(6, {
        upperCaseAlphabets: true,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
      });
    });

    it('should call configService.get with correct parameters', async () => {
      await useCase.execute(email);
      expect(configService.get).toHaveBeenCalledWith(
        'EMAIL_FROM_FOR_FORGOT_PASSWORD',
      );
    });

    it('should call emailSender.send with correct parameters', async () => {
      await useCase.execute(email);
      expect(emailSender.send).toHaveBeenCalledWith(
        email,
        emailFrom,
        'Seu Código de Verificação',
        'forgot-password-email',
        {
          code: OTPCode,
        },
      );
    });

    it('should call codeRepository.save with correct parameters', async () => {
      await useCase.execute(email);
      const expiresIn = new Date().getTime() + 1000 * 60 * 10;
      expect(codeRepository.save).toHaveBeenCalledWith(
        email,
        OTPCode,
        expiresIn,
      );
    });

    it('should rethrow error if emailSender throw error', async () => {
      jest
        .spyOn(emailSender, 'send')
        .mockRejectedValue(new Error('Error sending email'));

      await expect(() => useCase.execute(email)).rejects.toThrow(
        'Error sending email',
      );
    });

    it('should rethrow error if codeRepository throw error', async () => {
      jest
        .spyOn(codeRepository, 'save')
        .mockRejectedValue(new Error('Error saving code'));

      await expect(() => useCase.execute(email)).rejects.toThrow(
        'Error saving code',
      );
    });
  });
});
