import { ClientProxy } from '@nestjs/microservices';
import { PhoneNumberConstants } from '@auth/domain/values-objects/phone-number/phone-number-constants';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { UsersQueueService } from './users-queue.service';
import { defaultRoles } from '@auth/domain/constants/roles';

describe('UsersQueueService', () => {
  let service: UsersQueueService;
  let clientProxy: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    clientProxy = {
      emit: jest.fn(),
    } as any;

    service = new UsersQueueService(clientProxy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(clientProxy).toBeDefined();
  });

  describe('send', () => {
    it('should send message broker', async () => {
      const value = {
        userID: '1',
        roles: defaultRoles,
        email: EmailConstants.EXEMPLE,
        phonenumber: PhoneNumberConstants.EXEMPLE,
      };
      const event = 'user-created';

      service.send(event, value);

      expect(clientProxy.emit).toHaveBeenCalledWith(event, value);
      expect(clientProxy.emit).toHaveBeenCalledTimes(1);
    });
  });
});
