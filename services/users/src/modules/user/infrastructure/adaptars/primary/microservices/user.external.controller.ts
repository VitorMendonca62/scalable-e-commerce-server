import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import UserRepository from '@modules/user/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@modules/user/infrastructure/mappers/user.mapper';
import { ExternalUser } from '@modules/user/domain/types/external-user';

@Controller('user-external')
export default class UserExternalController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  @EventPattern('user-create-google')
  async createUserGoogle(payload: ExternalUser) {
    const existingUser = await this.userRepository.findOne({
      userID: payload.userID,
    });

    if (existingUser !== null && existingUser !== undefined) {
      return;
    }

    await this.userRepository.create(
      this.userMapper.externalControllerPayloadForModel(payload),
    );
  }
}
