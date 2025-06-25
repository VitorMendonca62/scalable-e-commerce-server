import { UserEntity } from '@modules/auth/infrastructure/adaptars/secondary/database/entities/user.entity';

export abstract class UserRepository {
  abstract create(user: UserEntity): Promise<undefined>;
  abstract findOne(
    options: Record<string, string>,
  ): Promise<UserEntity | undefined>;
}
