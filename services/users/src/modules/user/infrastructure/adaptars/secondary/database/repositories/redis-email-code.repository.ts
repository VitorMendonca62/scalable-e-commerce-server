import EmailCodeRepository from '@modules/user/domain/ports/secondary/email-code-repository.port';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { TokenExpirationConstants } from '@modules/user/domain/constants/token-expirations';

export class RedisEmailCodeRepository implements EmailCodeRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async exists(email: string, code: string): Promise<boolean> {
    return (await this.redis.sismember(`emailcode:${email}`, code)) >= 1;
  }

  async deleteMany(email: string): Promise<void> {
    await this.redis.del(`emailcode:${email}`);
  }

  async save(email: string, code: string): Promise<void> {
    const key = `emailcode:${email}`;

    await this.redis.sadd(key, code);

    await this.redis.expire(key, TokenExpirationConstants.SIGN_UP_TOKEN_S); // 10min
  }
}
