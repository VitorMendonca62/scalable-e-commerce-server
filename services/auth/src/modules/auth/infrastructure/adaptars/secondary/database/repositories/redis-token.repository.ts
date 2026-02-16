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
    userAgent: string,
  ): Promise<void> {
    const tokenKey = `token:${tokenID}`;

    await this.redis.hset(tokenKey, {
      userID: userID,
      ip: ip,
      lastAccess: new Date().getTime(),
      createdAt: new Date().getTime(),
      userAgent: userAgent,
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
    const tokens = await this.redis.smembers(sessionsKey);

    if (tokens.length === 0) {
      await this.redis.del(sessionsKey);
      return;
    }

    const pipeline = this.redis.pipeline();

    const chunkSize = 1000;
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk = tokens.slice(i, i + chunkSize);
      pipeline.unlink(chunk);
    }

    pipeline.unlink(sessionsKey);
    await pipeline.exec();
  }

  async isRevoked(tokenID: string): Promise<boolean> {
    return (await this.redis.exists(`token:${tokenID}`)) === 0;
  }

  async updateLastAcess(tokenID: string): Promise<void> {
    await this.redis.hset(`token:${tokenID}`, {
      lastAccess: new Date().getTime(),
    });
  }
}
