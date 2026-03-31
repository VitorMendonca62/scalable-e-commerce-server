import RedisCacheProductRepository from './redis-cache-product.repository';
import CacheTime from '@product/domain/constants/cache-time';
import Redis from 'ioredis';
import { ProductFactory } from '@product/infrastructure/helpers/factories/product-factory';
import { FindWithFiltersReturn } from '@product/domain/ports/secondary/product-repository.port';

describe('RedisCacheProductRepository', () => {
  let repository: RedisCacheProductRepository;
  let redis: Redis;
  let pipeline: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    expire: ReturnType<typeof vi.fn>;
    exec: ReturnType<typeof vi.fn>;
    unlink: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    pipeline = {
      get: vi.fn().mockReturnThis(),
      unlink: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      del: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn(),
    };

    redis = {
      get: vi.fn(),
      pipeline: vi.fn().mockReturnValue(pipeline),
      del: vi.fn(),
      scan: vi.fn(),
    } as unknown as Redis;

    repository = new RedisCacheProductRepository(redis);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(redis).toBeDefined();
  });

  describe('getProduct', () => {
    it('should return null when key not found', async () => {
      vi.spyOn(redis, 'get').mockResolvedValue(null);

      const result = await repository.getProduct('public-1');

      expect(redis.get).toHaveBeenCalledWith('product:public-1');
      expect(result).toBeNull();
    });

    it('should return parsed product when found', async () => {
      const product = {
        ...ProductFactory.createModel(),
        rating: 4.1,
      };

      const serializedProduct = JSON.parse(JSON.stringify(product));

      vi.spyOn(redis, 'get').mockResolvedValue(
        JSON.stringify(serializedProduct),
      );

      const result = await repository.getProduct(product.publicID);

      expect(result).toEqual(serializedProduct);
    });
  });

  describe('addProduct', () => {
    it('should set product with TTL', async () => {
      const product = {
        ...ProductFactory.createModel(),
        rating: 4.1,
      };

      await repository.addProduct(product);

      expect(redis.pipeline).toHaveBeenCalledTimes(1);
      expect(pipeline.set).toHaveBeenCalledWith(
        `product:${product.publicID}`,
        JSON.stringify(product),
      );
      expect(pipeline.expire).toHaveBeenCalledWith(
        `product:${product.publicID}`,
        CacheTime.productSeconds,
      );
      expect(pipeline.exec).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProductsByFilters', () => {
    it('should return null when key not found', async () => {
      vi.spyOn(redis, 'get').mockResolvedValue(null);

      const result = await repository.getProductsByFilters('filters');

      expect(redis.get).toHaveBeenCalledWith('product-filters:filters');
      expect(result).toBeNull();
    });

    it('should return parsed products when found', async () => {
      const products: FindWithFiltersReturn[] = [
        {
          ...ProductFactory.createModel({
            id: undefined,
            active: undefined,
            categoryID: undefined,
            description: undefined,
          }),
          rating: 1.2,
        },
        {
          ...ProductFactory.createModel({
            publicID: 'p2',
            id: undefined,
            active: undefined,
            categoryID: undefined,
            description: undefined,
          }),
          rating: 2.3,
        },
      ];

      const serializedProducts = JSON.parse(JSON.stringify(products));

      vi.spyOn(redis, 'get').mockResolvedValue(
        JSON.stringify(serializedProducts),
      );

      const result = await repository.getProductsByFilters('filters');

      expect(result).toEqual(serializedProducts);
    });
  });

  describe('addProductsByFilters', () => {
    it('should set products list with TTL', async () => {
      const products = [
        { ...ProductFactory.createModel(), rating: 1.2 },
        { ...ProductFactory.createModel({ publicID: 'p2' }), rating: 2.3 },
      ];

      await repository.addProductsByFilters('filters', products);

      expect(redis.pipeline).toHaveBeenCalledTimes(1);
      expect(pipeline.set).toHaveBeenCalledWith(
        'product-filters:filters',
        JSON.stringify(products),
      );
      expect(pipeline.expire).toHaveBeenCalledWith(
        'product-filters:filters',
        CacheTime.productSeconds,
      );
      expect(pipeline.exec).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeProduct', () => {
    it('should delete product key', async () => {
      await repository.removeProduct('public-1');

      expect(redis.del).toHaveBeenCalledWith('product:public-1');
    });
  });

  describe('invalidateAll', () => {
    it('should delete product and filter keys', async () => {
      vi.spyOn(redis, 'scan')
        .mockResolvedValueOnce(['1', ['product:1']] as any)
        .mockResolvedValueOnce(['0', []] as any)
        .mockResolvedValueOnce(['1', ['product-filters:filters']] as any)
        .mockResolvedValueOnce(['0', []] as any);
      vi.spyOn(pipeline, 'exec').mockResolvedValue([] as any);

      await repository.invalidateAll();

      expect(redis.scan).toHaveBeenCalledTimes(4);
      expect(pipeline.unlink).toHaveBeenCalledWith('product:1');
      expect(pipeline.unlink).toHaveBeenCalledWith('product-filters:filters');
      expect(pipeline.exec).toHaveBeenCalledTimes(2);
    });

    it('should skip pipeline when no keys found', async () => {
      vi.spyOn(redis, 'scan')
        .mockResolvedValueOnce(['0', []] as any)
        .mockResolvedValueOnce(['0', []] as any);

      await repository.invalidateAll();

      expect(redis.scan).toHaveBeenCalledTimes(2);
      expect(pipeline.unlink).not.toHaveBeenCalled();
      expect(pipeline.exec).not.toHaveBeenCalled();
    });
  });
});
