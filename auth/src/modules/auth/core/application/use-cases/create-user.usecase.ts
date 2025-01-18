import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../../domain/user.entity';
import { CreateUserPort } from '../ports/primary/user.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';

@Injectable()
export class CreateUserUseCase implements CreateUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(user: User): Promise<void> {
    const userExistsWithUsername = await this.userRepository.findByUsername(
      user.username,
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
      throw new BadRequestException(
        'Esse email já está sendo utilizado. Tente outro',
      );
    }
    await this.userRepository.create(user);
  }
}
