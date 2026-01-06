import { Injectable } from '@nestjs/common';
import { NotFoundItem } from '@user/domain/ports/primary/http/error.port';
import { UserRepository } from '@user/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { UserUpdate } from '@user/domain/entities/user-update.entity';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(
    id: string,
    userUpdate: UserUpdate,
  ): Promise<
    Partial<
    Record<keyof UserUpdate, any> 
    >
  > {
    const user = await this.userRepository.findOne({ userId: id });

    if (user == undefined || user == null) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    if (!user.active) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    const userUpdated = await this.userRepository.update(
      id,
      this.userMapper.userUpdateModelForJSON(userUpdate),
    );

    return {
      name: userUpdated.name,
      username: userUpdated.username,
      email: userUpdated.email,
      avatar: userUpdated.avatar,
      phonenumber: userUpdated.phonenumber,
    };
  }
}
