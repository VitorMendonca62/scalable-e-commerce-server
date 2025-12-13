import { Permissions } from '@auth/domain/types/permissions';

export abstract class TokenService {
  abstract generateRefreshToken(id: string): string;
  abstract generateAccessToken(props: {
    userID: string;
    email: string;
    roles: Permissions[];
  }): string;
  abstract verifyToken(token: string): Record<string, any>;
}
