import CodeRepository from '@auth/domain/ports/secondary/code-repository.port';
import { EmailSender } from '@auth/domain/ports/secondary/mail-sender.port';
import { Injectable } from '@nestjs/common';
import { generate } from 'otp-generator';

@Injectable()
export default class SendCodeForForgotPasswordUseCase {
  constructor(
    private readonly emailSender: EmailSender,
    private readonly codeRepository: CodeRepository,
  ) {}

  async execute(email: string) {
    const OTPCode = generate(6, {
      upperCaseAlphabets: true,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    this.emailSender.send(
      email,
      'vitorqueiroz325@gmail.com',
      'Seu Código de Verificação',
      'forgot-password-email',
      {
        code: OTPCode,
      },
    );

    const expiresIn = new Date().getTime() + 1000 * 60 * 10;

    this.codeRepository.save(email, OTPCode, expiresIn);
  }
}
