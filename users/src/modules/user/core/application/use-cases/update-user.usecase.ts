import { Injectable, NotFoundException } from '@nestjs/common';
import { UserUpdate } from '../../domain/entities/user-update.entity';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserPort } from '../ports/primary/user.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';

@Injectable()
export class UpdateUserUseCase implements UpdateUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, newUser: UserUpdate): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return await this.userRepository.update(id, newUser);
  }
}
