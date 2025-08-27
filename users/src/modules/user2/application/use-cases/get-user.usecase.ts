import { Injectable } from '@nestjs/common';
import { UserEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/user.entity';
import { GetUserPort } from '@modules/user2/domain/ports/primary/user.port';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';
import { NotFoundUser } from '@modules/user2/domain/ports/primary/http/error.port';
import UsernameVO from '@modules/user2/domain/values-objects/user/username/username-vo';

@Injectable()
export class GetUserUseCase implements GetUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ user_id: id });

    if (!user) {
      throw new NotFoundUser();
    }

    return user;
  }

  async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      username,
    });

    if (user == undefined || user == null) {
      throw new NotFoundUser();
    }

    if (user.active) {
      throw new NotFoundUser();
    }

    return user;
  }
}
