import { UserLogin } from '@modules/auth/core/domain/entities/user-login.entity';

export interface CreateSessionOutbondPort {
  accessToken: string;
  refreshToken: string;
  type: 'Bearer';
}

export abstract class CreateSessionPort {
  abstract execute(inputUser: UserLogin): Promise<CreateSessionOutbondPort>;
}

export abstract class TokenServicePort {
  abstract generateRefreshToken(
    playload: Record<string, any>,
    expiresIn: string,
  ): string;
  abstract verifyToken(token: string): Record<string, any>;
}
