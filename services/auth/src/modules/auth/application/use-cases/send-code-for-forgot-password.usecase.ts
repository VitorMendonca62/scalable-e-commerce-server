import { TokenExpirationConstants } from '@auth/domain/constants/token-expirations';
import EmailCodeRepository from '@auth/domain/ports/secondary/email-code-repository.port';
import { EmailSender } from '@auth/domain/ports/secondary/mail-sender.port';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as otpGenerator from 'otp-generator';
import {
  SendCodeForForgotPasswordPort,
  ExecuteReturn,
} from '@auth/domain/ports/application/send-code-for-forgot-password.port';

@Injectable()
export default class SendCodeForForgotPasswordUseCase implements SendCodeForForgotPasswordPort {
  constructor(
    private readonly emailSender: EmailSender,
    private readonly emailCodeRepository: EmailCodeRepository,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async execute(email: string): Promise<ExecuteReturn> {
    const OTPCode = otpGenerator.generate(6, {
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
        code: OTPCode,
      },
    );

    const expiresIn =
      new Date().getTime() + TokenExpirationConstants.RESET_PASS_TOKEN_MS;

    await this.emailCodeRepository.save({
      email,
      code: OTPCode,
      expiresIn: new Date(expiresIn),
    });

    return {
      ok: true,
    };
  }
}
