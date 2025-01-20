import { UserLogin } from '@modules/auth/core/domain/entities/user-login.entity';
import { User } from '@modules/auth/core/domain/entities/user.entity';

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

export abstract class TokenServicePort {
  abstract generateRefreshToken(id: string): string;
  abstract generateAccessToken(user: User): string;
  abstract verifyToken(token: string): Record<string, any>;
}
