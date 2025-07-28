import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserEntity } from '../entities/user.entity';

@Injectable()
export class MongooseUserRepository extends UserRepository {
  constructor(
    @InjectModel(UserEntity.name) private UserModel: Model<UserDocument>,
  ) {
    super();
  }

  async create(user: UserEntity): Promise<undefined> {
    const userModel = new this.UserModel(user);
    await userModel.save();
  }

  async findOne(
    options: Record<string, string>,
  ): Promise<UserEntity | undefined> {
    return await this.UserModel.findOne(options).exec();
  }
}
