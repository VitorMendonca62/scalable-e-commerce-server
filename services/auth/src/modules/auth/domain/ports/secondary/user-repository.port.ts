import { UserModel } from '@auth/infrastructure/adaptars/secondary/database/models/user.model';

export abstract class UserRepository {
  abstract findOne(options: Partial<UserModel>): Promise<UserModel | null>;
  abstract update(userID: string, newFields: Partial<UserModel>): Promise<void>;
  abstract create(user: UserModel): Promise<UserModel>;
  abstract delete(userID: string, deletedAt: Date): Promise<void>;
}
