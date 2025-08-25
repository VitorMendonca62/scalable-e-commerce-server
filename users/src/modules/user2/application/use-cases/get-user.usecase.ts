import { Injectable } from '@nestjs/common';
import { UserEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/user.entity';
import { GetUserPort } from '@modules/user2/domain/ports/primary/user.port';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';
import { NotFoundUser } from '@modules/user2/domain/ports/primary/http/error.port';

@Injectable()
export class GetUserUseCase implements GetUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ id });

    if (!user) {
      throw new NotFoundUser();
    }

    return user;
  }

  async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ username });

    if (!user) {
      throw new NotFoundUser();
    }

    return user;
  }
}
