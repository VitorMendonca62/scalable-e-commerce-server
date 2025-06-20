import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  users: User[] = [];
  readonly keysCanToLowerCase = ['username', 'name', 'email'];

  async create(user: User): Promise<undefined> {
    user._id = v4();
    this.keysCanToLowerCase.forEach((key) => user[key].toLowerCase());

    this.users.push(user);
  }

  async findOne(options: Record<string, string>): Promise<User | undefined> {
    return this.users.find((user) => {
      for (const key of Object.keys(options)) {
        if (this.keysCanToLowerCase.includes(key)) {
          options[key] = options[key].toLowerCase();
        }

        const value =
          typeof user[key] == 'string' ? user[key] : user[key].getValue();

        if (options[key] != value) {
          return false;
        }

        return true;
      }
    });
  }
}
