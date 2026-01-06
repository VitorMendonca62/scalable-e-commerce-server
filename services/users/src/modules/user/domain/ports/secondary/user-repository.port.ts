import { UserEntity } from '@user/infrastructure/adaptars/secondary/database/entities/user.entity';
import { UserUpdate } from '../../entities/user-update.entity';

export abstract class UserRepository {
  abstract create(user: UserEntity): Promise<void>;
  abstract findOne(
    options: Partial<Record<keyof UserEntity, string>>,
  ): Promise<UserEntity | undefined>;
  abstract delete(id: string): Promise<void>;
  abstract update(
    id: string,
    newFields: Record<keyof UserUpdate, any>,
  ): Promise<UserEntity>;
}
