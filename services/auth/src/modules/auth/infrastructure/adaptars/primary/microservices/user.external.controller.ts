import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller('user-external')
export default class UserExternalController {
  constructor(private readonly userRepository: UserRepository) {}

  @EventPattern('user-deleted')
  async deleteUser(payload: { userID: string; deletedAt: string }) {
    await this.userRepository.delete(
      payload.userID,
      new Date(payload.deletedAt),
    );
  }

  @EventPattern('user-updated')
  async updateUser(payload: { userID: string; updatedAt: string }) {
    await this.userRepository.update(payload.userID, {
      updatedAt: new Date(payload.updatedAt),
    });
  }
}
