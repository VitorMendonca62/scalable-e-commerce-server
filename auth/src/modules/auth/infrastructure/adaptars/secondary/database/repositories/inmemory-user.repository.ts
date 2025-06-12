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

  async findOne(options: Record<string, string>): Promise<User | undefined> {
    return this.users.find((user) => {
      for (const key of Object.keys(options)) {
        if (!['_id'].includes(key)) {
          console.error(user, key, user[key]);
          options[key].toLocaleLowerCase ();
          console.log(options[key]);
          user[key].toLowerCase();
        }

        if (options[key] != user[key]) {
          return false;
        }
      }
    });
  }
}
