import { UserRepository } from '@modules/auth/core/application/ports/secondary/user-repository.interface';
import { User } from '@modules/auth/core/domain/entities/user.entity';

export class InMemoryUserRepository implements UserRepository {
  create(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }
  findByEmail(email: string): Promise<User | undefined> {
    throw new Error('Method not implemented.');
  }
  findByUsername(username: string): Promise<User | undefined> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<User | undefined> {
    throw new Error('Method not implemented.');
  }
}
