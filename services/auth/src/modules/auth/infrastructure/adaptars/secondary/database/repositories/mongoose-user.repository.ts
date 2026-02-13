import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserModel } from '../models/user.model';

@Injectable()
export class MongooseUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserModel.name) private UserModel: Model<UserDocument>,
  ) {}

  async findOne(
    options: Partial<UserModel>,
  ): Promise<UserModel | undefined | null> {
    return await this.UserModel.findOne({ ...options, deletedAt: null }).exec();
  }

  async update(userID: string, newFields: Partial<UserModel>): Promise<void> {
    await this.UserModel.updateOne(
      { userID, deletedAt: null },
      { $set: newFields },
    ).exec();
  }

  async create(user: UserModel): Promise<UserModel> {
    const userModel = new this.UserModel(user);
    await userModel.save();
    return user;
  }

  async delete(userID: string, deletedAt: Date): Promise<void> {
    await this.UserModel.updateOne(
      { userID, deletedAt: null },
      { $set: { deletedAt } },
    ).exec();
  }
}
