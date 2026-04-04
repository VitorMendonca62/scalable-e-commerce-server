import { EnvironmentVariables } from '@config/environment/env.validation';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';
import {
  SendEmailResult,
  ValidateCodeResult,
  ValidateEmailPort,
} from '@user/domain/ports/application/user/validate-email.port';

import EmailCodeRepository from '@user/domain/ports/secondary/email-code-repository.port';
import { EmailSender } from '@user/domain/ports/secondary/mail-sender.port';
import { TokenService } from '@user/domain/ports/secondary/token-service.port';
import { OtpGenerator } from '@user/domain/ports/secondary/otp-generator.port';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ValidateEmailUseCase implements ValidateEmailPort {
  constructor(
    private readonly emailSender: EmailSender,
    private readonly emailCodeRepository: EmailCodeRepository,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly tokenService: TokenService,
    private readonly otpGenerator: OtpGenerator,
  ) {}

  async sendEmail(email: string): Promise<SendEmailResult> {
    try {
      const OTPCode = this.otpGenerator.generate();

      await this.emailSender.send(
        email,
        this.configService.get<string>('EMAIL_FROM_FOR_VALIDATE_EMAIL'),
        'Seu Código de Validação',
        'validate-email',
        {
          code: OTPCode,
        },
      );

      await this.emailCodeRepository.save(email, OTPCode);

      return { ok: true };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel enviar o código de validação.',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }

  async validateCode(code: string, email: string): Promise<ValidateCodeResult> {
    try {
      if ((await this.emailCodeRepository.exists(email, code)) === false) {
        return {
          ok: false,
          message: 'Código de validação inválido ou expirado. Tente novamente',
          reason: ApplicationResultReasons.BUSINESS_RULE_FAILURE,
        };
      }

      await this.emailCodeRepository.deleteMany(email);

      return {
        ok: true,
        result: this.tokenService.generateSignUpToken({ email }),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel validar o código de verificação.',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
