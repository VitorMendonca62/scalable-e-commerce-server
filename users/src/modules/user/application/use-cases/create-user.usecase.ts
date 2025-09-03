import { Injectable } from '@nestjs/common';
import { UserRepository } from '@user/domain/ports/secondary/user-repository.port';
import { UsernameConstants } from '@user/domain/values-objects/user/username/username-constants';
import { FieldAlreadyExists } from '@user/domain/ports/primary/http/error.port';
import { EmailConstants } from '@user/domain/values-objects/user/email/email-constants';
import { User } from '@user/domain/entities/user.entity';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';

@Injectable()
export class CreateUserUseCase{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(user: User): Promise<void> {
    const userExistsWithUsername = await this.userRepository.findOne({
      username: `${user.username}`,
    });

    if (userExistsWithUsername != null && userExistsWithUsername != undefined) {
      throw new FieldAlreadyExists(
        UsernameConstants.ERROR_ALREADY_EXISTS,
        'username',
      );
    }

    const userExistsWithEmail = await this.userRepository.findOne({
      email: `${user.email}`,
    });

    if (userExistsWithEmail != null && userExistsWithEmail != undefined) {
      throw new FieldAlreadyExists(
        EmailConstants.ERROR_ALREADY_EXISTS,
        'email',
      );
    }
    await this.userRepository.create(this.userMapper.userToJSON(user));
  }
}
