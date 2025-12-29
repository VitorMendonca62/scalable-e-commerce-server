import * as otpGenerator from 'otp-generator';
import SendCodeForForgotPasswordUseCase from './send-code-for-forgot-password.usecase';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import EmailCodeRepository from '@auth/domain/ports/secondary/email-code-repository.port';
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
      jest.setSystemTime(new Date('2025-01-01T16:00:00.000Z'));
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
        'Seu Código de recuperação',
        'forgot-password-email',
        {
          code: OTPCode,
        },
      );
    });

    it('should call codeRepository.save with correct parameters', async () => {
      await useCase.execute(email);
      const expiresIn = new Date().getTime() + 1000 * 60 * 10;
      expect(codeRepository.save).toHaveBeenCalledWith({
        email,
        code: OTPCode,
        expiresIn: new Date(expiresIn),
      });
    });

    it('should rethrow error if emailSender throw error', async () => {
      jest
        .spyOn(emailSender, 'send')
        .mockRejectedValue(new Error('Error sending email'));

      try {
        await useCase.execute(email);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error sending email');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if codeRepository throw error', async () => {
      jest
        .spyOn(codeRepository, 'save')
        .mockRejectedValue(new Error('Error saving code'));

      try {
        await useCase.execute(email);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error saving code');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
