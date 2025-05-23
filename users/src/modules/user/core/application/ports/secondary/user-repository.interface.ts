import { UserUpdate } from '@modules/user/core/domain/entities/user-update.entity';
import { User } from '@user/core/domain/entities/user.entity';

export abstract class UserRepository {
  abstract create(user: User): Promise<void>;
  abstract getAll(): Promise<User[]>;
  abstract findByEmail(email: string): Promise<User | undefined>;
  abstract findByUsername(username: string): Promise<User | undefined>;
  abstract findById(id: string): Promise<User | undefined>;
  abstract delete(id: string): Promise<void>;
  abstract update(id: string, newUser: UserUpdate): Promise<User>;
}
