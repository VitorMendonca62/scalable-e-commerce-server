import { Injectable } from '@nestjs/common';
import { UpdateUserPort } from '../../domain/ports/primary/user.port';
import { NotFoundUser } from '@modules/user2/domain/ports/primary/http/error.port';
import { UserEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/user.entity';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';

@Injectable()
export class UpdateUserUseCase implements UpdateUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    id: string,
    newFields: Record<string, any>,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ userId: id });

    if (user == undefined || user == null) {
      throw new NotFoundUser();
    }

    return await this.userRepository.update(id, newFields);
  }
}
