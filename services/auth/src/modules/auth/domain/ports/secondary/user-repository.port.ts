import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { SessionUser } from '@auth/domain/types/session-user';
import { UserRecord } from '@auth/domain/types/user-record';

export abstract class UserRepository {
  abstract findOne(options: Partial<UserRecord>): Promise<UserRecord | null>;
  abstract findSessionUserByEmail(email: string): Promise<SessionUser | null>;
  abstract update(
    userID: string,
    newFields: Partial<UserRecord>,
  ): Promise<void>;
  abstract updateAccountProvider(
    userID: string,
    accountProvider: AccountsProvider,
    accountProviderID: string,
  ): Promise<void>;
  abstract create(user: UserRecord): Promise<void>;
  abstract createGoogleUser(
    user: UserGoogleLogin,
    userID: string,
  ): Promise<SessionUser>;
  abstract delete(userID: string, deletedAt: Date): Promise<void>;
}
