import { ExternalServiceError } from '@auth/domain/ports/primary/http/errors.port';
import { EmailConstants } from '@auth/domain/values-objects/constants';
import { MailerService } from '@nestjs-modules/mailer';
import NodemailerEmailSender from './nodemailer.service';

describe('NodemailerEmailSender', () => {
  let service: NodemailerEmailSender;
  let mailerService: MailerService;

  beforeEach(async () => {
    mailerService = {
      sendMail: vi.fn(),
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
      vi.spyOn(mailerService, 'sendMail').mockImplementation(() => {
        throw new Error('Error finding email');
      });

      try {
        await service.send(
          EmailConstants.EXEMPLE,
          `test.${EmailConstants.EXEMPLE}`,
          'test',
          'any-any-any',
          {
            any: 'any',
          },
        );
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ExternalServiceError);
        expect(error.message).toBe(
          'Erro ao comunicar com serviço de email. Tente novamente mais tarde',
        );
        expect(error.data).toBeUndefined();
      }
    });
  });
});
