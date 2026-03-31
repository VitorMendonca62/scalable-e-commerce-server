import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import CacheTime from '@product/domain/constants/cache-time';
import {
  CacheProductRepository,
  CachedProduct,
} from '@product/domain/ports/secondary/cache-product-repository.port';
import { FindWithFiltersReturn } from '@product/domain/ports/secondary/product-repository.port';

@Injectable()
export default class RedisCacheProductRepository implements CacheProductRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getProduct(id: string): Promise<CachedProduct | null> {
    const key = `product:${id}`;
    const value = await this.redis.get(key);

    if (value === null) return null;

    return JSON.parse(value) as CachedProduct;
  }

  async addProduct(product: CachedProduct): Promise<void> {
    const key = `product:${product.publicID}`;

    await this.redis
      .pipeline()
      .set(key, JSON.stringify(product))
      .expire(key, CacheTime.productSeconds)
      .exec();
  }

  async getProductsByFilters(
    key: string,
  ): Promise<FindWithFiltersReturn[] | null> {
    const cacheKey = `product-filters:${key}`;
    const value = await this.redis.get(cacheKey);

    if (value === null) return null;

    return JSON.parse(value) as FindWithFiltersReturn[];
  }

  async addProductsByFilters(
    key: string,
    products: FindWithFiltersReturn[],
  ): Promise<void> {
    const cacheKey = `product-filters:${key}`;

    await this.redis
      .pipeline()
      .set(cacheKey, JSON.stringify(products))
      .expire(cacheKey, CacheTime.productSeconds)
      .exec();
  }

  async removeProduct(id: string): Promise<void> {
    const key = `product:${id}`;
    await this.redis.del(key);
  }

  async invalidateAll(): Promise<void> {
    await this.deleteByPattern('product:*');
    await this.deleteByPattern('product-filters:*');
  }

  private async deleteByPattern(pattern: string): Promise<void> {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        200,
      );

      if (keys.length > 0) {
        const pipeline = this.redis.pipeline();
        keys.forEach((key) => pipeline.unlink(key));
        await pipeline.exec();
      }

      cursor = nextCursor;
    } while (cursor !== '0');
  }
}
