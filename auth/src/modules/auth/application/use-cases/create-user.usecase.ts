import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { CreateUserPort } from '@modules/auth/domain/ports/primary/user.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { FieldlAlreadyExists } from '@modules/auth/domain/types/errors/errors';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/UsernameConstants';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';

@Injectable()
export class CreateUserUseCase implements CreateUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(user: User): Promise<void> {
    const userExistsWithUsername = await this.userRepository.findOne({
      username: user.username.getValue(),
    });

    if (userExistsWithUsername) {
      throw new FieldlAlreadyExists(
        UsernameConstants.ERROR_ALREADY_EXISTS,
        'username',
      );
    }

    const userExistsWithEmail = await this.userRepository.findOne({
      email: user.email.getValue(),
    });

    if (userExistsWithEmail) {
      throw new FieldlAlreadyExists(
        EmailConstants.ERROR_ALREADY_EXISTS,
        'email',
      );
    }

    await this.userRepository.create(user);
  }
}
