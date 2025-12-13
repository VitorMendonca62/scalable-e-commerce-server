import { UserLogin } from '@auth/domain/entities/user-login.entity';

export interface CreateSessionOutbondPort {
  accessToken: string;
  refreshToken: string;
  type: 'Bearer';
}

export abstract class CreateSessionPort {
  abstract execute(inputUser: UserLogin): Promise<CreateSessionOutbondPort>;
}

export abstract class GetAccessTokenPort {
  abstract execute(refreshToken: string): Promise<string>;
}
