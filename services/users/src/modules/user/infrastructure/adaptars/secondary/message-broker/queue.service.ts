import { Injectable } from '@nestjs/common';
import { UsersQueueService } from './rabbitmq/users_queue/users-queue.service';
import { UserOutboundMessageBroker } from '@user/domain/ports/secondary/message-broker.port';
import { UpdateUserDTO } from '../../primary/http/dtos/user/update-user.dto';

@Injectable()
export default class QueueService {
  constructor(private readonly usersQueueService: UsersQueueService) {}

  async sendUserCreated(newUser: UserOutboundMessageBroker) {
    return this.usersQueueService.send(
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
  }

  async sendUserUpdated(userID: string, updates: UpdateUserDTO) {
    return this.usersQueueService.send(
      'user-updated',
      {
        userID,
        ...updates,
      },
      true,
    );
  }

  async sendUserDeleted(userID: string) {
    return this.usersQueueService.send(
      'user-deleted',
      {
        userID,
      },
      true,
    );
  }
}
