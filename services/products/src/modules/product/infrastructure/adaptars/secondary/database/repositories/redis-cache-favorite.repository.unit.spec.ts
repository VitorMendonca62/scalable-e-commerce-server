import RedisCacheFavoriteRepository from './redis-cache-favorite.repository';
import CacheTime from '@product/domain/constants/cache-time';
import Redis from 'ioredis';

describe('RedisCacheFavoriteRepository', () => {
  let repository: RedisCacheFavoriteRepository;
  let redis: Redis;
  let pipeline: {
    sadd: ReturnType<typeof vi.fn>;
    srem: ReturnType<typeof vi.fn>;
    expire: ReturnType<typeof vi.fn>;
    exec: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    pipeline = {
      sadd: vi.fn().mockReturnThis(),
      srem: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn(),
    };

    redis = {
      exists: vi.fn(),
      sismember: vi.fn(),
      pipeline: vi.fn().mockReturnValue(pipeline),
    } as unknown as Redis;

    repository = new RedisCacheFavoriteRepository(redis);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(redis).toBeDefined();
  });

  describe('isFavorite', () => {
    it('should return null when key not found', async () => {
      vi.spyOn(redis, 'exists').mockResolvedValue(0 as any);

      const result = await repository.isFavorite('user-1', 'product-1');

      expect(redis.exists).toHaveBeenCalledWith('favorite:user:user-1');
      expect(result).toBeNull();
    });

    it('should return true when value is 1', async () => {
      vi.spyOn(redis, 'exists').mockResolvedValue(1 as any);
      vi.spyOn(redis, 'sismember').mockResolvedValue(1 as any);

      const result = await repository.isFavorite('user-1', 'product-1');

      expect(result).toBe(true);
    });

    it('should return false when value is 0', async () => {
      vi.spyOn(redis, 'exists').mockResolvedValue(1 as any);
      vi.spyOn(redis, 'sismember').mockResolvedValue(0 as any);

      const result = await repository.isFavorite('user-1', 'product-1');

      expect(result).toBe(false);
    });
  });

  describe('addFavorite', () => {
    it('should set favorite with TTL', async () => {
      await repository.addFavorite('user-1', 'product-1');

      expect(redis.pipeline).toHaveBeenCalledTimes(1);
      expect(pipeline.sadd).toHaveBeenCalledWith(
        'favorite:user:user-1',
        'product-1',
      );
      expect(pipeline.expire).toHaveBeenCalledWith(
        'favorite:user:user-1',
        CacheTime.favoriteSeconds,
      );
      expect(pipeline.exec).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeFavorite', () => {
    it('should delete favorite key', async () => {
      await repository.removeFavorite('user-1', 'product-1');

      expect(redis.pipeline).toHaveBeenCalledTimes(1);
      expect(pipeline.srem).toHaveBeenCalledWith(
        'favorite:user:user-1',
        'product-1',
      );
      expect(pipeline.expire).toHaveBeenCalledWith(
        'favorite:user:user-1',
        CacheTime.favoriteSeconds,
      );
      expect(pipeline.exec).toHaveBeenCalledTimes(1);
    });
  });
});
