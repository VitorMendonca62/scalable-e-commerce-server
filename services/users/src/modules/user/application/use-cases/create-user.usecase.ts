import { Injectable } from '@nestjs/common';
import { UserRepository } from '@user/domain/ports/secondary/user-repository.port';
import { FieldAlreadyExists } from '@user/domain/ports/primary/http/error.port';
import { User } from '@user/domain/entities/user.entity';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { EmailConstants, UsernameConstants } from '@modules/user/domain/values-objects/user/constants';

@Injectable()
export class CreateUserUseCase{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(user: User): Promise<void> {
    const userExistsWithUsername = await this.userRepository.findOne({
      username: user.username.getValue(),
    });

    if (userExistsWithUsername != null && userExistsWithUsername != undefined) {
      throw new FieldAlreadyExists(
        UsernameConstants.ERROR_ALREADY_EXISTS,
        'username',
      );
    }

    const userExistsWithEmail = await this.userRepository.findOne({
      email: user.email.getValue(),
    });

    if (userExistsWithEmail != null && userExistsWithEmail != undefined) {
      throw new FieldAlreadyExists(
        EmailConstants.ERROR_ALREADY_EXISTS,
        'email',
      );
    }
    await this.userRepository.create(this.userMapper.userModelToJSON(user));
  }
}
