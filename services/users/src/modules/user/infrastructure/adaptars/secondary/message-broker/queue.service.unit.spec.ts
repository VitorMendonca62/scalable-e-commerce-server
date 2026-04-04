import { type Mocked } from 'vitest';

import QueueService from './queue.service';
import { UsersQueueService } from './rabbitmq/users_queue/users-queue.service';
import { UserOutboundMessageBroker } from '@user/domain/ports/secondary/message-broker.port';
import { PasswordConstants } from '@user/domain/constants/password-constants';
import { PermissionsSystem } from '@user/domain/types/permissions';
import { UserDTOFactory } from '@user/infrastructure/helpers/users/factory';
import { UpdateUserDTO } from '../../primary/http/dtos/user/update-user.dto';
import { IDConstants } from '@user/domain/values-objects/common/constants';
describe('QueueService', () => {
  let service: QueueService;
  let usersQueueService: Mocked<UsersQueueService>;

  beforeEach(() => {
    usersQueueService = {
      send: vi.fn(),
    } as any;

    service = new QueueService(usersQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(usersQueueService).toBeDefined();
  });

  describe('sendUserCreated', () => {
    it('should send user created event with expected payload', async () => {
      const newUser: UserOutboundMessageBroker = {
        userID: 'user-123',
        email: 'test.user@example.com',
        password: PasswordConstants.EXEMPLE,
        roles: [PermissionsSystem.ENTER],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await service.sendUserCreated(newUser);

      expect(usersQueueService.send).toHaveBeenCalledWith(
        'user-created',
        {
          userID: newUser.userID,
          email: newUser.email,
          password: newUser.password,
          roles: newUser.roles,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
        true,
      );
    });
  });

  describe('sendUserUpdated', () => {
    it('should send user created event with expected payload', async () => {
      const newUser: UpdateUserDTO = UserDTOFactory.createUpdateUserDTO();
      const userID = IDConstants.EXEMPLE;
      await service.sendUserUpdated(userID, newUser);

      expect(usersQueueService.send).toHaveBeenCalledWith(
        'user-updated',
        {
          userID,
          ...newUser,
        },
        true,
      );
    });
  });

  describe('sendUserDeleted', () => {
    it('should send user created event with expected payload', async () => {
      const userID = IDConstants.EXEMPLE;
      await service.sendUserDeleted(userID);

      expect(usersQueueService.send).toHaveBeenCalledWith(
        'user-deleted',
        {
          userID,
        },
        true,
      );
    });
  });
});
