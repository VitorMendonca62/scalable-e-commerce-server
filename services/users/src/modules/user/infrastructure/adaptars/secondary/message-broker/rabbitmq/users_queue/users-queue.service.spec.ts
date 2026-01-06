import { ClientProxy } from '@nestjs/microservices';
import { UsersQueueService } from './users-queue.service';
import {
  EmailConstants,
  NameConstants,
  PhoneNumberConstants,
  UsernameConstants,
} from '@modules/user/domain/values-objects/user/constants';
import { defaultRoles } from '@modules/user/domain/types/permissions';

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
        _id: '1',
        roles: defaultRoles,
        email: EmailConstants.EXEMPLE,
        name: NameConstants.EXEMPLE,
        username: UsernameConstants.EXEMPLE,
        phonenumber: PhoneNumberConstants.EXEMPLE,
      };
      const event = 'user-created';

      service.send(event, value);

      expect(clientProxy.emit).toHaveBeenCalledWith(event, value);
      expect(clientProxy.emit).toHaveBeenCalledTimes(1);
    });
  });
});
