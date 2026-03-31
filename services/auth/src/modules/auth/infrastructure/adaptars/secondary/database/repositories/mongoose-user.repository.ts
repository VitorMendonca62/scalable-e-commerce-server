import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { SessionUser } from '@auth/domain/types/session-user';
import { UserRecord } from '@auth/domain/types/user-record';
import { defaultGoogleRoles } from '@auth/domain/constants/roles';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserModel } from '../models/user.model';

@Injectable()
export class MongooseUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserModel.name) private UserModel: Model<UserDocument>,
  ) {}

  async findOne(options: Partial<UserRecord>): Promise<UserRecord | null> {
    const user = await this.UserModel.findOne({ ...options, deletedAt: null })
      .lean()
      .exec();

    return user ? this.toUserRecord(user as UserModel) : null;
  }

  async findSessionUserByEmail(email: string): Promise<SessionUser | null> {
    const user = await this.UserModel.findOne({ email, deletedAt: null })
      .lean()
      .exec();

    return user ? this.toSessionUser(user) : null;
  }

  async update(userID: string, newFields: Partial<UserRecord>): Promise<void> {
    await this.UserModel.updateOne(
      { userID, deletedAt: null },
      { $set: newFields },
    ).exec();
  }

  async updateAccountProvider(
    userID: string,
    accountProvider: AccountsProvider,
    accountProviderID: string,
  ): Promise<void> {
    await this.UserModel.updateOne(
      { userID, deletedAt: null },
      { $set: { accountProvider, accountProviderID } },
    ).exec();
  }

  async create(user: UserRecord): Promise<void> {
    const userModel = new this.UserModel(user);
    await userModel.save();
  }

  async createGoogleUser(
    user: UserGoogleLogin,
    userID: string,
  ): Promise<SessionUser> {
    const newUser: UserModel = {
      userID,
      email: user.email.getValue(),
      password: undefined,
      roles: defaultGoogleRoles,
      accountProvider: AccountsProvider.GOOGLE,
      accountProviderID: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const userModel = new this.UserModel(newUser);
    const savedUser = await userModel.save();

    return this.toSessionUser(savedUser.toObject() as UserModel);
  }

  async delete(userID: string, deletedAt: Date): Promise<void> {
    await this.UserModel.updateOne(
      { userID, deletedAt: null },
      { $set: { deletedAt } },
    ).exec();
  }

  // TODO TIRAR DAQUI e colocar num map
  private toSessionUser(user: UserModel): SessionUser {
    return {
      userID: user.userID,
      email: user.email,
      password: user.password,
      roles: user.roles,
      accountProvider: user.accountProvider as AccountsProvider,
      accountProviderID: user.accountProviderID,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // TODO TIRAR DAQUI e colocar num map
  private toUserRecord(user: UserModel): UserRecord {
    return {
      userID: user.userID,
      email: user.email,
      password: user.password,
      roles: user.roles,
      accountProvider: user.accountProvider,
      accountProviderID: user.accountProviderID,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt ?? null,
    };
  }
}
