import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserModel } from '../models/user.model';

@Injectable()
export class MongooseUserRepository extends UserRepository {
  constructor(
    @InjectModel(UserModel.name) private UserModel: Model<UserDocument>,
  ) {
    super();
  }

  async findOne(
    options: Partial<UserModel>,
  ): Promise<UserModel | undefined | null> {
    return await this.UserModel.findOne(options).exec();
  }
}
