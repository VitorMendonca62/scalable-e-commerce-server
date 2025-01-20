import { UserRepository } from '@modules/auth/core/application/ports/secondary/user-repository.interface';
import { User } from '@modules/auth/core/domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  users: User[] = [];
  async create(user: User): Promise<undefined> {
    user._id = v4();
    this.users.push(user);

    // eslint-disable-next-line no-console
    console.table(this.users);
  }
  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email == email);
  }
  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username == username);
  }
  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user._id == id);
  }
}
