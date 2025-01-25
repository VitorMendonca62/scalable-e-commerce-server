import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { GetUserPort } from '../ports/primary/user.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';
@Injectable()
export class GetUserUseCase implements GetUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }
}
