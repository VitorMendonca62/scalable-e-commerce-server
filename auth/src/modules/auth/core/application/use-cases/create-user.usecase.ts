import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { CreateUserPort } from '../ports/primary/user.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';
import EmailVO from '../../domain/types/values-objects/email.vo';

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
      user.email,
    );

    if (userExistsWithEmail) {
      throw new BadRequestException(EmailVO.ERROR_ALREADY_EXISTS);
    }

    await this.userRepository.create(user);
  }
}
