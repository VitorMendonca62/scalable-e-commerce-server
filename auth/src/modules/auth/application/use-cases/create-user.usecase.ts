import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import EmailVO from '../../domain/values-objects/email.vo';
import { CreateUserPort } from '@modules/auth/domain/ports/primary/user.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';

@Injectable()
export class CreateUserUseCase implements CreateUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(user: User): Promise<void> {
    const userExistsWithUsername = await this.userRepository.findByUsername(
      user.username.getValue(),
    );

    if (userExistsWithUsername) {
      throw new BadRequestException(
        'Esse username já está sendo utilizado. Tente outro',
      );
    }

    const userExistsWithEmail = await this.userRepository.findByEmail(
      user.email.getValue(),
    );

    if (userExistsWithEmail) {
      throw new BadRequestException(EmailVO.ERROR_ALREADY_EXISTS);
    }

    await this.userRepository.create(user);
  }
}
