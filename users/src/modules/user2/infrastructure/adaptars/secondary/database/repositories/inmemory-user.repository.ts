import { Injectable } from '@nestjs/common';
import { UserRepository } from '@user/domain/ports/secondary/user-repository.port';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  users: UserEntity[] = [];
  lastID: number = 0;
  keysCanToLowerCase: string[] = ['name', 'username', 'email'];

  async create(user: UserEntity): Promise<void> {
    this.lastID++;
    user._id = this.lastID;
    this.users.push(user);
  }

  async findOne(
    options: Partial<Record<keyof UserEntity, string>>,
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
      }
      return true;
    });
  }

  async findById(id: string): Promise<UserEntity | undefined> {
    return this.users.find((user) => user.userId == id);
  }

  async update(
    id: string,
    newFields: { [key: string]: any },
  ): Promise<UserEntity> {
    const oldUser: UserEntity = this.users.find((user) => user.userId == id);
    const oldUserIndex = this.users.indexOf(oldUser);

    this.users[oldUserIndex] = { ...this.users[oldUserIndex], ...newFields };
    return this.users[oldUserIndex];
  }

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex((user) => user.userId === id);

    this.users.splice(index, 1);

    delete this.users[index];
  }
}
