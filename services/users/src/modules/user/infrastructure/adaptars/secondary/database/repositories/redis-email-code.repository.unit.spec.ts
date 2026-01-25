import { TokenExpirationConstants } from '@modules/user/domain/constants/token-expirations';
import { EmailConstants } from '@modules/user/domain/values-objects/user/constants';
import Redis from 'ioredis';
import { RedisEmailCodeRepository } from './redis-email-code.repository';

describe('RedisEmailCodeRepository', () => {
  let repository: RedisEmailCodeRepository;

  let redis: Redis;

  beforeEach(async () => {
    redis = {
      sismember: vi.fn().mockResolvedValue(2),
      sadd: vi.fn(),
      expire: vi.fn(),
      del: vi.fn(),
    } as any;

    repository = new RedisEmailCodeRepository(redis);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(redis).toBeDefined();
  });

  describe('save', () => {
    const email = EmailConstants.EXEMPLE;
    const code = 'AAAAAA';

    it('should call all functions with correct parameters', async () => {
      const key = `emailcode:${email}`;
      await repository.save(email, code);

      expect(redis.sadd).toHaveBeenCalledWith(key, code);
      expect(redis.expire).toHaveBeenCalledWith(
        key,
        TokenExpirationConstants.SIGN_UP_TOKEN_S,
      );
    });
  });

  describe('deleteMany', () => {
    const email = EmailConstants.EXEMPLE;

    it('should call all functions with correct parameters', async () => {
      const key = `emailcode:${email}`;

      await repository.deleteMany(email);

      expect(redis.del).toHaveBeenCalledWith(key);
    });
  });

  describe('exists', () => {
    const email = EmailConstants.EXEMPLE;
    const code = 'AAAAAA';

    it('should call all functions with correct parameters', async () => {
      const key = `emailcode:${email}`;
      await repository.exists(email, code);

      expect(redis.sismember).toHaveBeenCalledWith(key, code);
    });

    it('should return true if ismember result is greater than 1', async () => {
      const result = await repository.exists(email, code);

      expect(result).toBe(true);
    });

    it('should return true if ismember result is zero', async () => {
      vi.spyOn(redis, 'sismember').mockResolvedValue(0);
      const result = await repository.exists(email, code);

      expect(result).toBe(false);
    });
  });
});
