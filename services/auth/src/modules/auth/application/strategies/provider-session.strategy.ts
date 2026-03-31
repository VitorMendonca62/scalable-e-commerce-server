import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { SessionUser } from '@auth/domain/types/session-user';

export type ProviderSessionInput = UserGoogleLogin;

export type ProviderSessionResult = {
  baseUser: SessionUser;
  newUser?: SessionUser;
};

export interface ProviderSessionStrategy {
  readonly provider: AccountsProvider;
  execute(input: ProviderSessionInput): Promise<ProviderSessionResult>;
}
