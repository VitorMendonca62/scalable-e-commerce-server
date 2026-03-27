import RedisCacheCategoryRepository from './redis-cache-category.repository';
import { CategoryFactory } from '@product/infrastructure/helpers/factories/category-factory';
import CacheTime from '@product/domain/constants/cache-time';
import Redis from 'ioredis';

describe('RedisCacheCategoryRepository', () => {
  let repository: RedisCacheCategoryRepository;
  let redis: Redis;
  let pipeline: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    sadd: ReturnType<typeof vi.fn>;
    srem: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    expire: ReturnType<typeof vi.fn>;
    exec: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    pipeline = {
      get: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      sadd: vi.fn().mockReturnThis(),
      srem: vi.fn().mockReturnThis(),
      del: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn(),
    };

    redis = {
      smembers: vi.fn(),
      pipeline: vi.fn().mockReturnValue(pipeline),
      del: vi.fn(),
      scan: vi.fn(),
    } as unknown as Redis;

    repository = new RedisCacheCategoryRepository(redis);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(redis).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return null when no keys found', async () => {
      vi.spyOn(redis, 'smembers').mockResolvedValue([] as any);

      const result = await repository.getCategories('0');

      expect(redis.smembers).toHaveBeenCalledWith('category-cursor:0');
      expect(result).toBeNull();
    });

    it('should return categories sorted by id', async () => {
      const categoryKeys = ['category:1', 'category:2'];
      const first = CategoryFactory.createPublicWithID({ id: 2, name: 'b' });
      const second = CategoryFactory.createPublicWithID({ id: 1, name: 'a' });

      vi.spyOn(redis, 'smembers').mockResolvedValue(categoryKeys as any);
      vi.spyOn(pipeline, 'exec').mockResolvedValue([
        [null, JSON.stringify(first)],
        [null, JSON.stringify(second)],
      ] as any);

      const result = await repository.getCategories('10');

      expect(redis.smembers).toHaveBeenCalledWith('category-cursor:10');
      expect(pipeline.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual([second, first]);
    });

    it('should return empty array when marker is present', async () => {
      vi.spyOn(redis, 'smembers').mockResolvedValue(['__empty__'] as any);

      const result = await repository.getCategories('0');

      expect(redis.smembers).toHaveBeenCalledWith('category-cursor:0');
      expect(result).toEqual([]);
    });

    it('should ignore null results from pipeline', async () => {
      const categoryKeys = ['category:1', 'category:2'];
      const category = CategoryFactory.createPublicWithID({ id: 1 });

      vi.spyOn(redis, 'smembers').mockResolvedValue(categoryKeys as any);
      vi.spyOn(pipeline, 'exec').mockResolvedValue([
        [null, JSON.stringify(category)],
        [null, null],
      ] as any);

      const result = await repository.getCategories('10');

      expect(result).toEqual([category]);
    });
  });

  describe('add', () => {
    it('should add categories and set TTLs', async () => {
      const categories = [
        CategoryFactory.createPublicWithID({ id: 1, publicID: 'p1' }),
        CategoryFactory.createPublicWithID({ id: 2, publicID: 'p2' }),
      ];

      await repository.add('5', categories);

      expect(redis.pipeline).toHaveBeenCalledTimes(1);
      expect(pipeline.set).toHaveBeenCalledTimes(2);
      expect(pipeline.sadd).toHaveBeenCalledTimes(2);
      expect(pipeline.expire).toHaveBeenCalledTimes(3);

      expect(pipeline.set).toHaveBeenNthCalledWith(
        1,
        'category:p1',
        JSON.stringify(categories[0]),
      );
      expect(pipeline.sadd).toHaveBeenNthCalledWith(
        1,
        'category-cursor:5',
        'category:p1',
      );
      expect(pipeline.set).toHaveBeenNthCalledWith(
        2,
        'category:p2',
        JSON.stringify(categories[1]),
      );
      expect(pipeline.sadd).toHaveBeenNthCalledWith(
        2,
        'category-cursor:5',
        'category:p2',
      );
      expect(pipeline.expire).toHaveBeenNthCalledWith(
        1,
        'category:p1',
        CacheTime.categorySeconds,
      );
      expect(pipeline.expire).toHaveBeenNthCalledWith(
        2,
        'category:p2',
        CacheTime.categorySeconds,
      );
      expect(pipeline.expire).toHaveBeenCalledWith(
        'category-cursor:5',
        CacheTime.categorySeconds,
      );

      expect(pipeline.exec).toHaveBeenCalledTimes(1);
    });

    it('should cache empty page marker when categories is empty', async () => {
      await repository.add('0', []);

      expect(redis.pipeline).toHaveBeenCalledTimes(1);
      expect(pipeline.sadd).toHaveBeenCalledWith(
        'category-cursor:0',
        '__empty__',
      );
      expect(pipeline.set).not.toHaveBeenCalled();
      expect(pipeline.expire).toHaveBeenCalledWith(
        'category-cursor:0',
        CacheTime.categorySeconds,
      );
      expect(pipeline.exec).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeByPublicID', () => {
    it('should delete key and remove from cursor sets', async () => {
      vi.spyOn(redis, 'del').mockResolvedValue(1 as any);
      vi.spyOn(redis, 'scan')
        .mockResolvedValueOnce([
          '1',
          ['category-cursor:0', 'category-cursor:25'],
        ] as any)
        .mockResolvedValueOnce(['0', []] as any);
      vi.spyOn(pipeline, 'exec').mockResolvedValue([] as any);

      await repository.removeByPublicID('public-1');

      expect(redis.del).toHaveBeenCalledWith('category:public-1');
      expect(redis.scan).toHaveBeenCalledTimes(2);
      expect(pipeline.srem).toHaveBeenCalledWith(
        'category-cursor:0',
        'category:public-1',
      );
      expect(pipeline.srem).toHaveBeenCalledWith(
        'category-cursor:25',
        'category:public-1',
      );
      expect(pipeline.exec).toHaveBeenCalledTimes(1);
    });

    it('should skip pipeline when no keys found', async () => {
      vi.spyOn(redis, 'del').mockResolvedValue(1 as any);
      vi.spyOn(redis, 'scan').mockResolvedValueOnce(['0', []] as any);

      await repository.removeByPublicID('public-2');

      expect(redis.del).toHaveBeenCalledWith('category:public-2');
      expect(redis.scan).toHaveBeenCalledTimes(1);
      expect(pipeline.srem).not.toHaveBeenCalled();
      expect(pipeline.exec).not.toHaveBeenCalled();
    });
  });

  describe('invalidateAll', () => {
    it('should delete all category keys', async () => {
      vi.spyOn(redis, 'scan')
        .mockResolvedValueOnce(['1', ['category:1', 'category-cursor:0']] as any)
        .mockResolvedValueOnce(['0', []] as any);
      vi.spyOn(pipeline, 'exec').mockResolvedValue([] as any);

      await repository.invalidateAll();

      expect(redis.scan).toHaveBeenCalledTimes(2);
      expect(pipeline.del).toHaveBeenCalledWith('category:1');
      expect(pipeline.del).toHaveBeenCalledWith('category-cursor:0');
      expect(pipeline.exec).toHaveBeenCalledTimes(1);
    });

    it('should skip pipeline when no keys found', async () => {
      vi.spyOn(redis, 'scan').mockResolvedValueOnce(['0', []] as any);

      await repository.invalidateAll();

      expect(redis.scan).toHaveBeenCalledTimes(1);
      expect(pipeline.del).not.toHaveBeenCalled();
      expect(pipeline.exec).not.toHaveBeenCalled();
    });
  });
});
