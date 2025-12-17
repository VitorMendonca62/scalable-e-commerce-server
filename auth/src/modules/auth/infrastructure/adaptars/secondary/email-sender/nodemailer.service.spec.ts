import { ExternalServiceError } from '@auth/domain/ports/primary/http/errors.port';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { MailerService } from '@nestjs-modules/mailer';
import NodemailerEmailSender from './nodemailer.service';

describe('NodemailerEmailSender', () => {
  let service: NodemailerEmailSender;
  let mailerService: MailerService;

  beforeEach(async () => {
    mailerService = {
      sendMail: jest.fn(),
    } as any;

    service = new NodemailerEmailSender(mailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mailerService).toBeDefined();
  });

  describe('send', () => {
    it('should call mailerService.sendMail with correct parameters', async () => {
      const payload = {
        to: EmailConstants.EXEMPLE,
        from: `test.${EmailConstants.EXEMPLE}`,
        subject: 'test',
        template: 'any-any-any',
        context: {
          any: 'any',
        },
      };

      service.send(
        EmailConstants.EXEMPLE,
        `test.${EmailConstants.EXEMPLE}`,
        'test',
        'any-any-any',
        {
          any: 'any',
        },
      );

      expect(mailerService.sendMail).toHaveBeenCalledWith(payload);
    });

    it('should throw ExternalServiceError if mailerService throw error', async () => {
      jest.spyOn(mailerService, 'sendMail').mockImplementation(() => {
        throw new Error('Error finding email');
      });

      await expect(
        service.send(
          EmailConstants.EXEMPLE,
          `test.${EmailConstants.EXEMPLE}`,
          'test',
          'any-any-any',
          {
            any: 'any',
          },
        ),
      ).rejects.toThrow(
        new ExternalServiceError(
          'Erro ao comunicar com serviço de email. Tente novamente mais tarde',
        ),
      );
    });
  });
});
