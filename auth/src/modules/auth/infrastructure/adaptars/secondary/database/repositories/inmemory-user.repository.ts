import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { UserModel } from '../models/user.model';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  users: UserModel[] = [];
  readonly keysCanToLowerCase = ['email'];

  async findOne(options: Partial<UserModel>): Promise<UserModel | undefined> {
    return this.users.find((user) => {
      for (const key of Object.keys(options)) {
        if (this.keysCanToLowerCase.includes(key)) {
          options[key] = options[key].toLowerCase();
        }

        const value = user[key];

        if (options[key] != value) {
          return false;
        }
      }
      return true;
    });
  }
}
