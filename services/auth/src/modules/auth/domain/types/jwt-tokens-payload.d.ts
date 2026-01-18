type JWTTokensTypes = 'refresh' | 'access' | 'reset-pass';

interface JWTBasicPayload {
  sub: string;
  iat: number;
  exp: number;
  type: string;
}

interface JWTRefreshTokenPayLoad extends JWTBasicPayload {
  jti: string;
  type: 'refresh';
}

interface JWTAccessTokenPayLoad extends JWTBasicPayload {
  email: string;
  roles: PermissionsSystem[];
  type: 'access';
}

interface JWTResetPassTokenPayLoad extends JWTBasicPayload {
  type: 'reset-pass';
}
