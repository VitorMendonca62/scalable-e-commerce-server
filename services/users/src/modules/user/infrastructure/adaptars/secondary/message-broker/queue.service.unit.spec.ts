import { type Mocked } from 'vitest';

import QueueService from './queue.service';
import { UsersQueueService } from './rabbitmq/users_queue/users-queue.service';
import { UserOutboundMessageBroker } from '@modules/user/domain/ports/secondary/message-broker.port';
import { PasswordConstants } from '@modules/user/domain/constants/password-constants';
import { PermissionsSystem } from '@modules/user/domain/types/permissions';
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
});
