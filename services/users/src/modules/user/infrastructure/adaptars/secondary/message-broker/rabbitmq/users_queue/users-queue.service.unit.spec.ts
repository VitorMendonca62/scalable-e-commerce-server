import { defaultRoles } from '@modules/user/domain/constants/roles';
import {
  EmailConstants,
  PhoneNumberConstants,
} from '@modules/user/domain/values-objects/user/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Mocked } from 'vitest';
import { UsersQueueService } from './users-queue.service';

describe('UsersQueueService', () => {
  let service: UsersQueueService;
  let clientProxy: Mocked<ClientProxy>;

  beforeEach(async () => {
    clientProxy = {
      emit: vi.fn(),
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
