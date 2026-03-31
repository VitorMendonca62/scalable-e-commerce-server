import { Injectable } from '@nestjs/common';
import { UsersQueueService } from './rabbitmq/users_queue/users-queue.service';
import { NewUserGoogle } from '@auth/domain/types/user-google';

@Injectable()
export default class QueueService {
  constructor(private readonly usersQueueService: UsersQueueService) {}

  async sendUserCreatedWithGoogle(newUserGoogle: NewUserGoogle) {
    await this.usersQueueService.send(
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
  }
}
