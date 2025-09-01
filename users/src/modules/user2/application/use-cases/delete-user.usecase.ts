import { Injectable } from '@nestjs/common';
import { UserRepository } from '@user/domain/ports/secondary/user-repository.port';
import { NotFoundItem } from '@modules/user2/domain/ports/primary/http/error.port';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ userId: id });

    if (!user) {
      throw new NotFoundItem();
    }

    await this.userRepository.delete(id);
  }
}
