import UserModel from '@modules/user/infrastructure/adaptars/secondary/database/models/user.model';

export default abstract class UserRepository {
  abstract create(user: Omit<UserModel, 'id'>): Promise<void>;

  abstract findOne(
    options: Omit<Partial<UserModel>, 'roles'>,
  ): Promise<Omit<UserModel, 'id'> | undefined | null>;

  abstract findOneWithOR(
    options: Omit<Partial<UserModel>, 'roles'>[],
    withDeleted: boolean,
  ): Promise<Omit<UserModel, 'id'> | undefined | null>;

  abstract delete(userID: string): Promise<number>;

  abstract update(
    userID: string,
    newFields: Partial<UserModel>,
  ): Promise<number>;
}
