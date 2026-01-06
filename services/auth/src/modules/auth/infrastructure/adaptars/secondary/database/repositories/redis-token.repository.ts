import { TokenExpirationConstants } from '@auth/domain/constants/token-expirations';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

export class RedisTokenRepository implements TokenRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async saveSession(
    tokenID: string,
    userID: string,
    ip: string,
  ): Promise<void> {
    const tokenKey = `token:${tokenID}`;

    await this.redis.hset(tokenKey, {
      userID: userID,
      ip: ip,
      lastAccess: new Date().getTime(),
      createdAt: new Date().getTime(),
    });

    await this.redis.sadd(`session:${userID}`, tokenKey);
    await this.redis.expire(
      tokenKey,
      TokenExpirationConstants.REFRESH_TOKEN_SECONDS,
    ); // 7D
  }

  async revokeOneSession(tokenID: string, userID: string): Promise<void> {
    const tokenKey = `token:${tokenID}`;
    await this.redis.del(tokenKey);
    await this.redis.srem(`session:${userID}`, tokenKey);
  }

  async revokeAllSessions(userID: string): Promise<void> {
    const sessionsKey = `session:${userID}`;

    const tokens = (await this.redis.smembers(sessionsKey)) as string[];

    await this.redis.del(...tokens);
    await this.redis.del(sessionsKey);
  }

  async isRevoked(tokenID: string): Promise<boolean> {
    return (await this.redis.exists(`token:${tokenID}`)) == 0;
  }

  async updateLastAcess(tokenID: string): Promise<void> {
    await this.redis.hset(`token:${tokenID}`, {
      lastAccess: new Date().getTime(),
    });
  }
}
