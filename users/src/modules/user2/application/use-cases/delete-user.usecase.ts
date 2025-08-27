import { DeleteUserPort } from '@user/domain/ports/primary/user.port';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@user/domain/ports/secondary/user-repository.port';
import { NotFoundUser } from '@modules/user2/domain/ports/primary/http/error.port';

@Injectable()
export class DeleteUserUseCase implements DeleteUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ user_id: id });

    if (!user) {
      throw new NotFoundUser();
    }

    await this.userRepository.delete(id);
  }
}
