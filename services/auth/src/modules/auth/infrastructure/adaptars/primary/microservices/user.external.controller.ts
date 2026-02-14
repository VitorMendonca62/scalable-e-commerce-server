import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CreateExternalUserDTO } from './dtos/create-user.dto';

@Controller('user-external')
export default class UserExternalController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

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

  @EventPattern('user-created')
  async createUser(payload: CreateExternalUserDTO) {
    await this.userRepository.create(
      this.userMapper.externalUserForModel(payload),
    );
  }
}
