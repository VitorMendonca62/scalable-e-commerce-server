import { User, UserDocument } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@modules/auth/infrastructure/mappers/user.mapper';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MongooseUserRepository extends UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private userMapper: UserMapper,
  ) {
    super();
  }

  async create(user: User): Promise<undefined> {
    const userModel = new this.userModel(this.userMapper.userToJSON(user));
    await userModel.save();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userModel.find({ email }).exec()[0];
  }
  async findByUsername(username: string): Promise<User | undefined> {
    return await this.userModel.find({ username }).exec()[0];
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.userModel.find({ id }).exec()[0];
  }
}
