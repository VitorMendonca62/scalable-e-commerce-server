import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserRepository from '@modules/user/domain/ports/secondary/user-repository.port';
import UserModel from '../models/user.model';

@Injectable()
export default class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserModel)
    private usersRepository: Repository<UserModel>,
  ) {}

  async create(user: Omit<UserModel, 'id'>): Promise<void> {
    await this.usersRepository.save(user);
  }

  async findOne(
    options: Omit<Partial<UserModel>, 'roles'>,
  ): Promise<UserModel | undefined | null> {
    return await this.usersRepository.findOneBy({ ...options });
  }

  async findOneWithOR(
    options: Omit<Partial<UserModel>, 'roles'>[],
    withDeleted: boolean,
  ): Promise<UserModel | undefined | null> {
    return await this.usersRepository.findOne({
      where: options,
      withDeleted,
    });
  }

  async delete(userID: string): Promise<number> {
    return (await this.usersRepository.softDelete({ userID })).affected;
  }

  async update(userID: string, newFields: Partial<UserModel>): Promise<number> {
    return (await this.usersRepository.update({ userID }, newFields)).affected;
  }
}
