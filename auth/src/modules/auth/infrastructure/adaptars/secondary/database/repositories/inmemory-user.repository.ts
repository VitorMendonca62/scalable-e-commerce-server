import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  users: User[] = [];
  async create(user: User): Promise<undefined> {
    user._id = v4();
    this.users.push(user);
  }
  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email.getValue() == email);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username.getValue() == username);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user._id == id);
  }
}
