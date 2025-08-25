import { UserEntity } from '@user/infrastructure/adaptars/secondary/database/entities/user.entity';

export abstract class UserRepository {
  abstract create(user: UserEntity): Promise<void>;
  abstract getAll(): Promise<UserEntity[]>;
  abstract findOne(
    options: Record<string, string>,
  ): Promise<UserEntity | undefined>;
  abstract delete(id: string): Promise<void>;
  abstract update(
    id: string,
    newFields: { [key: string]: any },
  ): Promise<UserEntity>;
}
