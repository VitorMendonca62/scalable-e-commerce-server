import Redis from 'ioredis';
import { RedisTokenRepository } from './redis-token.repository';
import IDConstants from '@auth/domain/values-objects/id/id-constants';

describe('RedisTokenRepository', () => {
  let repository: RedisTokenRepository;

  let redis: Redis;

  beforeEach(async () => {
    redis = {
      hset: vi.fn(),
      sadd: vi.fn(),
      expire: vi.fn(),
      del: vi.fn(),
      srem: vi.fn(),
      exists: vi.fn(),
      smembers: vi.fn(),
    } as any;

    repository = new RedisTokenRepository(redis);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(redis).toBeDefined();
  });

  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-01T16:00:00.000Z'));

  const tokenID = `token-${IDConstants.EXEMPLE}`;
  const userID = IDConstants.EXEMPLE;
  const ip = '122.0.0.0';
  const userAgent = 'agent';

  describe('saveSession', () => {
    it('should call all functions with correct parameters', async () => {
      const tokenKey = `token:${tokenID}`;
      await repository.saveSession(tokenID, userID, ip, userAgent);

      expect(redis.hset).toHaveBeenCalledWith(tokenKey, {
        userID: userID,
        ip: ip,
        lastAccess: new Date().getTime(),
        createdAt: new Date().getTime(),
        userAgent,
      });
      expect(redis.sadd).toHaveBeenCalledWith(`session:${userID}`, tokenKey);
      expect(redis.expire).toHaveBeenCalledWith(tokenKey, 604800);
    });
  });

  describe('revokeOneSession', () => {
    it('should call all functions with correct parameters', async () => {
      const tokenKey = `token:${tokenID}`;
      await repository.revokeOneSession(tokenID, userID);

      expect(redis.del).toHaveBeenCalledWith(tokenKey);
      expect(redis.srem).toHaveBeenCalledWith(`session:${userID}`, tokenKey);
    });
  });

  describe('revokeAllSessions', () => {
    it('should call all functions with correct parameters', async () => {
      const tokensKeys = ['token:1', 'token:2,', 'token:3'];

      vi.spyOn(redis, 'smembers').mockResolvedValue(tokensKeys);

      const sessionsKey = `session:${userID}`;

      await repository.revokeAllSessions(userID);

      expect(redis.smembers).toHaveBeenCalledWith(sessionsKey);
      expect(redis.del).toHaveBeenNthCalledWith(1, ...tokensKeys);
      expect(redis.del).toHaveBeenNthCalledWith(2, sessionsKey);
    });

    it('should no call redis.del if tokens length is 0', async () => {
      const tokensKeys = [];

      vi.spyOn(redis, 'smembers').mockResolvedValue(tokensKeys);

      const sessionsKey = `session:${userID}`;

      await repository.revokeAllSessions(userID);

      expect(redis.smembers).toHaveBeenCalledWith(sessionsKey);
      expect(redis.del).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('isRevoked', () => {
    it('should call all functions with correct parameters', async () => {
      await repository.isRevoked(tokenID);

      expect(redis.exists).toHaveBeenCalledWith(`token:${tokenID}`);
    });

    it('should return true if key not exists in database', async () => {
      vi.spyOn(redis, 'exists').mockResolvedValue(0);

      const result = await repository.isRevoked(tokenID);
      expect(result).toBe(true);
    });

    it('should return false if key exists in database', async () => {
      vi.spyOn(redis, 'exists').mockResolvedValue(1);

      const result = await repository.isRevoked(tokenID);
      expect(result).toBe(false);
    });
  });

  describe('updateLastAcess', () => {
    it('should call all functions with correct parameters', async () => {
      await repository.updateLastAcess(tokenID);
      expect(redis.hset).toHaveBeenCalledWith(`token:${tokenID}`, {
        lastAccess: new Date().getTime(),
      });
    });
  });
});
