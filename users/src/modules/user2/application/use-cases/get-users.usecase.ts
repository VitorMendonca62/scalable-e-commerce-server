import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/user.entity';
import { GetUsersPort } from '@modules/user2/domain/ports/primary/user.port';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';

@Injectable()
export class GetUsersUseCase implements GetUsersPort {
  constructor(private readonly userRepository: UserRepository) {}

  async getAll(): Promise<UserEntity[]> {
    const users = await this.userRepository.getAll();

    if (users.length == 0) {
      throw new NotFoundException('Não há usuários cadastrados.');
    }

    return users;
  }
}
