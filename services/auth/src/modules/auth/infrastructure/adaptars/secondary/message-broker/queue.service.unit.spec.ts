import { type Mocked } from 'vitest';

import QueueService from './queue.service';
import { UsersQueueService } from './rabbitmq/users_queue/users-queue.service';
import { PermissionsSystem } from '@auth/domain/types/permissions';
import { type NewUserGoogle } from '@auth/domain/types/user-google';

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

  describe('sendUserCreatedWithGoogle', () => {
    it('should send user created event with expected payload', async () => {
      const newUserGoogle: NewUserGoogle = {
        userID: 'user-123',
        name: 'Test User',
        username: 'test.user',
        email: 'test.user@example.com',
        roles: [PermissionsSystem.ENTER],
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      };

      await service.sendUserCreatedWithGoogle(newUserGoogle);

      expect(usersQueueService.send).toHaveBeenCalledWith(
        'user-create-google',
        {
          userID: newUserGoogle.userID,
          name: newUserGoogle.name,
          username: newUserGoogle.username,
          email: newUserGoogle.email,
          roles: newUserGoogle.roles,
          createdAt: newUserGoogle.createdAt,
          updatedAt: newUserGoogle.updatedAt,
        },
        true,
      );
    });
  });
});
