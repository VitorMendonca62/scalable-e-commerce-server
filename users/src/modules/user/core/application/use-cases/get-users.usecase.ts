import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { GetUsersPort } from '../ports/primary/user.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';

@Injectable()
export class GetUsersUseCase implements GetUsersPort {
  constructor(private readonly userRepository: UserRepository) {}

  async getAll(): Promise<User[]> {
    const users = await this.userRepository.getAll();

    if (users.length == 0) {
      throw new NotFoundException('Não existem usuários cadastrados');
    }

    return users;
  }
}
