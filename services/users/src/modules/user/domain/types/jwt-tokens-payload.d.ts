type JWTTokensTypes = 'signup';

interface JWTBasicPayload {
  sub: string;
  iat: number;
  exp: number;
  type: string;
}

interface JWTSignUpTokenPayLoad extends JWTBasicPayload {
  type: 'signup';
}
