import { PermissionsSystem } from '@auth/domain/types/permissions';

export abstract class TokenService {
  abstract generateRefreshToken(id: string): {
    refreshToken: string;
    tokenID: string;
  };
  abstract generateAccessToken(props: {
    userID: string;
    email: string;
    roles: PermissionsSystem[];
  }): string;
  abstract generateResetPassToken(props: { email: string }): string;
}
