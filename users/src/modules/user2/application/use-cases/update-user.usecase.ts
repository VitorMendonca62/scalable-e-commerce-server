import { Injectable } from '@nestjs/common';
import { UpdateUserPort } from '../../domain/ports/primary/user.port';
import { NotFoundUser } from '@modules/user2/domain/ports/primary/http/error.port';
import { UserEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/user.entity';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@modules/user2/infrastructure/mappers/user.mapper';
import { UserUpdate } from '@modules/user2/domain/entities/user-update.entity';

@Injectable()
export class UpdateUserUseCase implements UpdateUserPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(id: string, userUpdate: UserUpdate): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ userId: id });

    if (user == undefined || user == null) {
      throw new NotFoundUser();
    }

    if (!user.active) {
      throw new NotFoundUser();
    }

    return await this.userRepository.update(
      id,
      this.userMapper.updateEntityForJSON(userUpdate),
    );
  }
}
