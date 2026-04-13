import { TokenExpirationConstants } from '@auth/domain/constants/token-expirations';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import {
  ForgotPasswordPort,
  SendCodeReturn,
  ValidateCodeReturn,
} from '@auth/domain/ports/application/forgot-password.port';
import EmailCodeRepository from '@auth/domain/ports/secondary/email-code-repository.port';
import { EmailSender } from '@auth/domain/ports/secondary/mail-sender.port';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as otpGenerator from 'otp-generator';

@Injectable()
export default class ForgotPasswordUseCase implements ForgotPasswordPort {
  constructor(
    private readonly emailCodeRepository: EmailCodeRepository,
    private readonly tokenService: TokenService,
    private readonly emailSender: EmailSender,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async sendCode(email: string): Promise<SendCodeReturn> {
    try {
      const otpCode = otpGenerator.generate(6, {
        upperCaseAlphabets: true,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
      });

      await this.emailSender.send(
        email,
        this.configService.get<string>('EMAIL_FROM_FOR_FORGOT_PASSWORD'),
        'Seu Código de recuperação',
        'forgot-password-email',
        {
          code: otpCode,
        },
      );

      const expiresIn =
        Date.now() + TokenExpirationConstants.RESET_PASS_TOKEN_MS;

      await this.emailCodeRepository.save({
        email,
        code: otpCode,
        expiresIn: new Date(expiresIn),
      });

      return {
        ok: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      };
    }
  }

  async validateCode(code: string, email: string): Promise<ValidateCodeReturn> {
    try {
      const emailCode = await this.emailCodeRepository.findOne({ code, email });
      const invalidMessage =
        'Código de recuperação inválido ou expirado. Tente novamente';

      if (emailCode === undefined || emailCode === null)
        return {
          ok: false,
          reason: ApplicationResultReasons.FIELD_INVALID,
          message: invalidMessage,
          result: 'code',
        };

      if (emailCode.expiresIn < new Date())
        return {
          ok: false,
          reason: ApplicationResultReasons.FIELD_INVALID,
          message: invalidMessage,
          result: 'code',
        };

      await this.emailCodeRepository.deleteMany(email);

      return {
        ok: true,
        result: await this.tokenService.generateResetPassToken({ email }),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      };
    }
  }
}
