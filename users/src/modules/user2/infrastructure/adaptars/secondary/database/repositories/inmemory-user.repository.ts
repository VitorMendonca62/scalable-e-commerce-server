import { Injectable } from '@nestjs/common';
import { UserRepository } from '@user/domain/ports/secondary/user-repository.port';
import { UserEntity } from '../entities/user.entity';
import { defaultRoles } from '@modules/user2/domain/types/permissions';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  users: UserEntity[] = [
    {
      _id: 1,
      userId: '20f4b8ce-c6a2-49c7-972b-5e969a29cea9',
      name: 'Matthew Lockman',
      username: 'Adolf62',
      email: 'Melisa_Crist@gmail.com',
      avatar: 'null',
      active: true,
      email_verified: false,
      phone_verified: false,
      phonenumber: '+5581999999999',
      roles: defaultRoles,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  lastID: number = 0;
  keysCanToLowerCase: string[] = ['name', 'username', 'email'];

  async create(user: UserEntity): Promise<void> {
    this.lastID++;
    user._id = this.lastID;
    this.users.push(user);
    console.log(this.users);
  }

  async findOne(
    options: Partial<Record<keyof UserEntity, string>>,
  ): Promise<UserEntity | undefined> {
    return this.users.find((user) => {
      for (const key of Object.keys(options)) {
        if (this.keysCanToLowerCase.includes(key)) {
          options[key] = options[key].toLowerCase();
        }

        const value = this.keysCanToLowerCase.includes(key)
          ? user[key].toLowerCase()
          : user[key];
        if (options[key] != value) {
          return false;
        }
      }

      return true;
    });
  }

  async update(
    id: string,
    newFields: { [key: string]: any },
  ): Promise<UserEntity> {
    const oldUser: UserEntity = this.users.find((user) => user.userId == id);
    const oldUserIndex = this.users.indexOf(oldUser);

    console.log(this.users[oldUserIndex], newFields);

    this.users[oldUserIndex] = { ...this.users[oldUserIndex], ...newFields };
    return this.users[oldUserIndex];
  }

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex((user) => user.userId === id);

    this.users[index].active = false;
  }
}
