import { EnvironmentVariables } from '@config/environment/env.validation';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';
import {
  SendEmailResult,
  ValidateCodeResult,
  ValidateEmailPort,
} from '@modules/user/domain/ports/application/user/validate-email.port';

import EmailCodeRepository from '@modules/user/domain/ports/secondary/email-code-repository.port';
import { EmailSender } from '@modules/user/domain/ports/secondary/mail-sender.port';
import { TokenService } from '@modules/user/domain/ports/secondary/token-service.port';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as otpGenerator from 'otp-generator';

@Injectable()
export class ValidateEmailUseCase implements ValidateEmailPort {
  constructor(
    private readonly emailSender: EmailSender,
    private readonly emailCodeRepository: EmailCodeRepository,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly tokenService: TokenService,
  ) {}

  async sendEmail(email: string): Promise<SendEmailResult> {
    const OTPCode = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

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
  }

  async validateCode(code: string, email: string): Promise<ValidateCodeResult> {
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
  }
}
