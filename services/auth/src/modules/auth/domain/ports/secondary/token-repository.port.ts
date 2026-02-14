export abstract class TokenRepository {
  abstract saveSession(
    tokenID: string,
    userID: string,
    ip: string,
    userAgent: string,
  ): Promise<void>;

  abstract revokeOneSession(tokenID: string, userID: string): Promise<void>;

  abstract revokeAllSessions(userID: string): Promise<void>;

  abstract isRevoked(tokenID: string): Promise<boolean>;

  abstract updateLastAcess(tokenID: string): Promise<void>;
}
