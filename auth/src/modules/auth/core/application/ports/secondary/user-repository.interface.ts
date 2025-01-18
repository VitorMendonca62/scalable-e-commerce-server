import { User } from '@modules/auth/core/domain/entities/user.entity';

export abstract class UserRepository {
  abstract create(user: User): Promise<User>;
  abstract findByEmail(email: string): Promise<User | undefined>;
  abstract findByUsername(username: string): Promise<User | undefined>;
  abstract findById(id: string): Promise<User | undefined>;
}
