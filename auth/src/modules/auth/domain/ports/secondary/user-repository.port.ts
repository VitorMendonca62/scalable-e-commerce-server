import { User } from '@auth/domain/entities/user.entity';

export abstract class UserRepository {
  abstract create(user: User): Promise<undefined>;
  abstract findOne(options: Record<string, string>): Promise<User | undefined>;
}
