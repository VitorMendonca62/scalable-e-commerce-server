import CodeRepository from '@auth/domain/ports/secondary/code-repository.port';
import { EmailSender } from '@auth/domain/ports/secondary/mail-sender.port';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as otpGenerator from 'otp-generator';

@Injectable()
export default class SendCodeForForgotPasswordUseCase {
  constructor(
    private readonly emailSender: EmailSender,
    private readonly codeRepository: CodeRepository,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async execute(email: string) {
    const OTPCode = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    await this.emailSender.send(
      email,
      this.configService.get<string>('EMAIL_FROM_FOR_FORGOT_PASSWORD'),
      'Seu Código de Verificação',
      'forgot-password-email',
      {
        code: OTPCode,
      },
    );

    const expiresIn = new Date().getTime() + 1000 * 60 * 10;

    await this.codeRepository.save(email, OTPCode, expiresIn);
  }
}
