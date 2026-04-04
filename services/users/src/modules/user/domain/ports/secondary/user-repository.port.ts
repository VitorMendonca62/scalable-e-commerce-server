import { UserRecord } from '@user/domain/types/user-record';

export default abstract class UserRepository {
  abstract create(user: UserRecord): Promise<void>;

  abstract findOne(
    options: Omit<Partial<UserRecord>, 'roles'>,
  ): Promise<UserRecord | undefined | null>;

  abstract findOneWithOR(
    options: Omit<Partial<UserRecord>, 'roles'>[],
    withDeleted: boolean,
  ): Promise<UserRecord | undefined | null>;

  abstract delete(userID: string): Promise<number>;

  abstract update(
    userID: string,
    newFields: Partial<UserRecord>,
  ): Promise<number>;
}
