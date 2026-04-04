import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserRepository from '@user/domain/ports/secondary/user-repository.port';
import UserModel from '../models/user.model';
import { UserRecord } from '@user/domain/types/user-record';
import { AddressRecord } from '@user/domain/types/address-record';
import AddressModel from '../models/address.model';

@Injectable()
export default class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserModel)
    private usersRepository: Repository<UserModel>,
  ) {}

  async create(user: UserRecord): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { addresses, ...userData } = user;
    await this.usersRepository.save(userData as UserModel);
  }

  async findOne(
    options: Omit<Partial<UserRecord>, 'roles'>,
  ): Promise<UserRecord | undefined | null> {
    const user = await this.usersRepository.findOneBy({ ...options });
    return this.mapUserModelToRecord(user);
  }

  async findOneWithOR(
    options: Omit<Partial<UserRecord>, 'roles'>[],
    withDeleted: boolean,
  ): Promise<UserRecord | undefined | null> {
    const user = await this.usersRepository.findOne({
      where: options,
      withDeleted,
    });
    return this.mapUserModelToRecord(user);
  }

  async delete(userID: string): Promise<number> {
    return (await this.usersRepository.softDelete({ userID })).affected;
  }

  async update(
    userID: string,
    newFields: Partial<UserRecord>,
  ): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { addresses, ...userData } = newFields;
    return (await this.usersRepository.update({ userID }, userData)).affected;
  }

  //TODO Colocar em um mapper
  private mapAddressModelToRecord(
    address: AddressModel,
    userID: string,
  ): AddressRecord {
    return {
      id: address.id,
      userID,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      postalCode: address.postalCode,
      state: address.state,
      country: address.country,
      createdAt: address.createdAt,
    };
  }

  //TODO Colocar em um mapper

  private mapUserModelToRecord(
    user: UserModel | undefined | null,
  ): UserRecord | undefined | null {
    if (user === null || user === undefined) {
      return user as null;
    }

    const addresses = user.addresses?.map((address) =>
      this.mapAddressModelToRecord(address, user.userID),
    );

    return {
      userID: user.userID,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      roles: user.roles,
      addresses,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
