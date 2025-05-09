import { User } from '@modules/auth/core/domain/entities/user.entity';
import EmailVO from '@modules/auth/core/domain/types/values-objects/email.vo';

export abstract class UserRepository {
  abstract create(user: User): Promise<undefined>;
  abstract findByEmail(email: EmailVO): Promise<User | undefined>;
  abstract findByUsername(username: string): Promise<User | undefined>;
  abstract findById(id: string): Promise<User | undefined>;
}
