import { UserLogin } from '@modules/auth/domain/entities/user-login.entity';
import { UserEntity } from '@modules/auth/infrastructure/adaptars/secondary/database/entities/user.entity';

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

// TODO: Colocar isso em uma porta em secondary
export abstract class TokenService {
  abstract generateRefreshToken(id: string): string;
  abstract generateAccessToken(user: UserEntity): string;
  abstract verifyToken(token: string): Record<string, any>;
}
