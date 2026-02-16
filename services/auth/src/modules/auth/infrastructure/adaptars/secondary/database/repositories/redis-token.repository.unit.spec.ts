import Redis from 'ioredis';
import { RedisTokenRepository } from './redis-token.repository';
import IDConstants from '@auth/domain/values-objects/id/id-constants';
import { Mock } from 'vitest';

describe('RedisTokenRepository', () => {
  let repository: RedisTokenRepository;

  let redis: Redis;

  let mockPipelineExec: Mock;
  let mockPipelineDel: Mock;

  beforeEach(async () => {
    mockPipelineExec = vi.fn();
    mockPipelineDel = vi.fn();
    redis = {
      hset: vi.fn(),
      sadd: vi.fn(),
      expire: vi.fn(),
      del: vi.fn(),
      srem: vi.fn(),
      exists: vi.fn(),
      smembers: vi.fn(),
      pipeline: vi.fn(() => {
        return {
          del: mockPipelineDel,
          exec: mockPipelineExec,
        };
      }),
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
      expect(redis.smembers).toHaveBeenCalledTimes(1);
      expect(redis.pipeline).toHaveBeenCalled();
      expect(redis.pipeline).toHaveBeenCalledTimes(1);
      expect(mockPipelineDel).toHaveBeenCalledWith(...tokensKeys);
      expect(mockPipelineDel).toHaveBeenCalledTimes(1);
      expect(mockPipelineExec).toHaveBeenCalled();
      expect(mockPipelineExec).toHaveBeenCalledTimes(1);
      expect(redis.del).toHaveBeenCalledWith(sessionsKey);
      expect(redis.del).toHaveBeenCalledTimes(1);
    });

    it('should delete in chunks', async () => {
      const tokensKeys = Array.from({ length: 750 }, (_, i) => `token:${i}`);

      const expectFirstChunkTokensKeys = Array.from(
        { length: 500 },
        (_, i) => `token:${i}`,
      );

      const expecSecondChunkTokensKeys = Array.from(
        { length: 250 },
        (_, i) => `token:${i + 500}`,
      );

      vi.spyOn(redis, 'smembers').mockResolvedValue(tokensKeys);

      const sessionsKey = `session:${userID}`;

      await repository.revokeAllSessions(userID);

      expect(redis.smembers).toHaveBeenCalledWith(sessionsKey);
      expect(redis.smembers).toHaveBeenCalledTimes(1);
      expect(redis.pipeline).toHaveBeenCalled();
      expect(redis.pipeline).toHaveBeenCalledTimes(2);
      expect(mockPipelineDel).toHaveBeenNthCalledWith(
        1,
        ...expectFirstChunkTokensKeys,
      );
      expect(mockPipelineDel).toHaveBeenNthCalledWith(
        2,
        ...expecSecondChunkTokensKeys,
      );
      expect(mockPipelineDel).toHaveBeenCalledTimes(2);
      expect(mockPipelineExec).toHaveBeenCalled();
      expect(mockPipelineExec).toHaveBeenCalledTimes(2);
      expect(redis.del).toHaveBeenCalledWith(sessionsKey);
      expect(redis.del).toHaveBeenCalledTimes(1);
    });

    it('should no call redis.del if tokens length is 0', async () => {
      const tokensKeys = [];

      vi.spyOn(redis, 'smembers').mockResolvedValue(tokensKeys);

      const sessionsKey = `session:${userID}`;

      await repository.revokeAllSessions(userID);

      expect(redis.smembers).toHaveBeenCalledWith(sessionsKey);
      expect(redis.smembers).toHaveBeenCalledTimes(1);
      expect(redis.pipeline).not.toHaveBeenCalled();
      expect(mockPipelineDel).not.toHaveBeenCalled();
      expect(mockPipelineExec).not.toHaveBeenCalled();
      expect(redis.del).toHaveBeenCalled();
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
