import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import EmailVO from '../../domain/values-objects/email.vo';
import { CreateUserPort } from '@modules/auth/domain/ports/primary/user.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import UsernameVO from '@modules/auth/domain/values-objects/username.vo';
import { FieldlAlreadyExists } from '@modules/auth/domain/types/errors/errors';

@Injectable()
export class CreateUserUseCase implements CreateUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(user: User): Promise<void> {
    const userExistsWithUsername = await this.userRepository.findOne({
      username: user.username.getValue(),
    });

    if (userExistsWithUsername) {
      throw new FieldlAlreadyExists(UsernameVO.ERROR_ALREADY_EXISTS);
    }

    const userExistsWithEmail = await this.userRepository.findOne({
      email: user.email.getValue(),
    });

    if (userExistsWithEmail) {
      throw new FieldlAlreadyExists(EmailVO.ERROR_ALREADY_EXISTS);
    }

    await this.userRepository.create(user);
  }
}
