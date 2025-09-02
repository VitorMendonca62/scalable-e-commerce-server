import { Injectable } from '@nestjs/common';
import { UserEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/user.entity';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';
import { NotFoundItem } from '@modules/user2/domain/ports/primary/http/error.port';
import UsernameVO from '@modules/user2/domain/values-objects/user/username/username-vo';
import { isUUID } from 'class-validator';
import { IDValidator } from '@modules/user2/domain/values-objects/uuid/id-validator';
import { UsernameValidator } from '@modules/user2/domain/values-objects/user/username/username-validator';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    identifier: string,
  ): Promise<Partial<Record<keyof UserEntity, any>>> {
    let user: UserEntity | null = null;

    if (isUUID(identifier)) {
      IDValidator.validate(identifier);
      user = await this.userRepository.findOne({ userId: identifier });
    }

    if (user == null || user == undefined) {
      UsernameValidator.validate(identifier, true);
      user = await this.userRepository.findOne({ username: identifier });

      if (user == null || user == undefined) {
        throw new NotFoundItem('Não foi possivel encontrar o usuário');
      }
    }

    if (!user.active) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    return {
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      phonenumber: user.phonenumber,
    };
  }
}
