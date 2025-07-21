import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  users: UserEntity[] = [];
  readonly keysCanToLowerCase = ['username', 'name', 'email'];

  async create(user: UserEntity): Promise<undefined> {
    user._id = v4();
    this.keysCanToLowerCase.forEach((key) => user[key].toLowerCase());

    this.users.push(user);
  }

  async findOne(
    options: Record<string, string>,
  ): Promise<UserEntity | undefined> {
    return this.users.find((user) => {
      for (const key of Object.keys(options)) {
        if (this.keysCanToLowerCase.includes(key)) {
          options[key] = options[key].toLowerCase();
        }

        const value = user[key];

        if (options[key] != value) {
          return false;
        }

        return true;
      }
    });
  }
}
