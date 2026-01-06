export abstract class TokenService {
  abstract verifyToken(token: string): Record<string, any>;
}
