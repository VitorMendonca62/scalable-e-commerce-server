import { UserRepository } from '@user/core/application/ports/secondary/user-repository.interface';
import { User } from '@user/core/domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { UserUpdate } from '@modules/user/core/domain/entities/user-update.entity';
import { Permissions } from '@modules/user/core/domain/types/permissions';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  users: User[] = [
    {
      _id: 'edd2023d-bf54-4185-b50f-9b4c08db82d4',
      name: 'Vitor Hugo',
      username: 'vitormendonca62',
      email: 'vitorqueiroz325@gmail.com',
      phonenumber: '+5581999999999',
      roles: [Permissions.ENTER, Permissions.READ_BOOKS],
    },
  ];
  async create(user: User): Promise<void> {
    user._id = v4();
    this.users.push(user);
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

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex((user) => user._id === id);

    this.users.splice(index, 1);

    delete this.users[index];
  }

  async getAll(): Promise<User[]> {
    return this.users;
  }

  async update(id: string, newUser: UserUpdate): Promise<User> {
    const oldUser: User = this.users.find((task) => task._id == id);
    const oldUserIndex = this.users.indexOf(oldUser);

    this.users[oldUserIndex] = { ...this.users[oldUserIndex], ...newUser };
    return this.users[oldUserIndex];
  }
}
