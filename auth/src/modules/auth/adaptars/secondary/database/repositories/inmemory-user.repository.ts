import { UserRepository } from '@modules/auth/core/application/ports/secondary/user-repository.interface';
import { User } from '@modules/auth/core/domain/entities/user.entity';
import EmailVO from '@modules/auth/core/domain/types/values-objects/email.vo';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  users: User[] = [];
  async create(user: User): Promise<undefined> {
    user._id = v4();
    this.users.push(user);
  }
  async findByEmail(email: EmailVO): Promise<User | undefined> {
    return this.users.find((user) => user.email == email);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username.getValue() == username);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user._id == id);
  }
}
