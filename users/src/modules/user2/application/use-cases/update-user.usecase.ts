import { Injectable } from '@nestjs/common';
import { UpdateUserPort } from '../../domain/ports/primary/user.port';
import { UserRepository } from '../../../user/domain/ports/secondary/user-repository.port';
import { NotFoundUser } from '@modules/user2/domain/ports/primary/http/error.port';
import { UserEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/user.entity';

@Injectable()
export class UpdateUserUseCase implements UpdateUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    id: string,
    newFields: Record<string, any>,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundUser();
    }

    return await this.userRepository.update(id, newFields);
  }
}
