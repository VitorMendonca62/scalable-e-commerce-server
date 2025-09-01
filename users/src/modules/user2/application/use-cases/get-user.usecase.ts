import { Injectable } from '@nestjs/common';
import { UserEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/user.entity';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';
import { NotFoundItem } from '@modules/user2/domain/ports/primary/http/error.port';
import UsernameVO from '@modules/user2/domain/values-objects/user/username/username-vo';

@Injectable()
export class GetUserUseCase{
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ userId: id });

    if (user == undefined || user == null) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    if (!user.active) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    return user;
  }

  async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      username,
    });

    if (user == undefined || user == null) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    if (!user.active) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    return user;
  }
}
