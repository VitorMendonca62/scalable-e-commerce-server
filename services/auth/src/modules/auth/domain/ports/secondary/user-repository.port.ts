import { UserModel } from '@auth/infrastructure/adaptars/secondary/database/models/user.model';

export abstract class UserRepository {
  abstract findOne(options: Partial<UserModel>): Promise<UserModel | undefined>;
  abstract update(userID: string, newFields: Partial<UserModel>): Promise<void>;
}
