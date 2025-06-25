import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { CreateUserPort } from '@modules/auth/domain/ports/primary/user.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { FieldAlreadyExists } from '@modules/auth/domain/ports/primary/http/errors.port';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/UsernameConstants';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';
import { UserMapper } from '@modules/auth/infrastructure/mappers/user.mapper';

@Injectable()
export class CreateUserUseCase implements CreateUserPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(user: User): Promise<void> {
    const userExistsWithUsername = await this.userRepository.findOne({
      username: `${user.username}`,
    });

    if (userExistsWithUsername) {
      throw new FieldAlreadyExists(
        UsernameConstants.ERROR_ALREADY_EXISTS,
        'username',
      );
    }

    const userExistsWithEmail = await this.userRepository.findOne({
      email: `${user.email}`,
    });

    if (userExistsWithEmail) {
      throw new FieldAlreadyExists(
        EmailConstants.ERROR_ALREADY_EXISTS,
        'email',
      );
    }

    await this.userRepository.create(this.userMapper.userToJSON(user));
  }
}
