import { Permissions } from './permissions';

interface JWTBasicPayload {
  sub: string;
  iat: number;
  exp: number;
  type: string;
}

export interface JWTRefreshTokenPayLoad extends JWTBasicPayload {
  jti: string;
  type: 'refresh';
}

export interface JWTAccessTokenPayLoad extends JWTBasicPayload {
  email: string;
  roles: Permissions[];
  type: 'access';
}

export interface JWTResetPassTokenPayLoad extends JWTBasicPayload {
  type: 'reset-pass';
}
