import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteUserPort } from '../ports/primary/user.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';

@Injectable()
export class DeleteUserUseCase implements DeleteUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.userRepository.delete(id);
  }
}
