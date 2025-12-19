import { Permissions } from '@auth/domain/types/permissions';

export abstract class TokenService {
  abstract generateRefreshToken(id: string): string;
  abstract generateAccessToken(props: {
    userID: string;
    email: string;
    roles: Permissions[];
  }): string;
  abstract generateResetPassToken(props: { email: string }): string;
}
