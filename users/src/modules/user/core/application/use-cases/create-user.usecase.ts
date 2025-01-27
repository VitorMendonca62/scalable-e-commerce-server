import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { CreateUserPort } from '../ports/primary/user.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';

@Injectable()
export class CreateUserUseCase implements CreateUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(user: User): Promise<void> {
    await this.userRepository.create(user);
  }
}
