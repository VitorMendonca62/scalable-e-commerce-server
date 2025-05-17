import { User } from '@auth/domain/entities/user.entity';

export abstract class UserRepository {
  abstract create(user: User): Promise<undefined>;
  abstract findByEmail(email: string): Promise<User | undefined>;
  abstract findByUsername(username: string): Promise<User | undefined>;
  abstract findById(id: string): Promise<User | undefined>;
}
