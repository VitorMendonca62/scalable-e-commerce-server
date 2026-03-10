import { ExternalServiceException } from '@product/domain/ports/primary/http/error.port';
import { EmailSender } from '@product/domain/ports/secondary/mail-sender.port';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class NodemailerEmailSender implements EmailSender {
  constructor(private readonly mailerService: MailerService) {}

  async send(
    to: string,
    from: string,
    subject: string,
    template: string,
    context: { [key: string]: string },
  ) {
    try {
      this.mailerService.sendMail({
        to,
        from,
        subject,
        template,
        context,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new ExternalServiceException(
        'Erro ao comunicar com serviço de email. Tente novamente mais tarde',
      );
    }
  }
}
