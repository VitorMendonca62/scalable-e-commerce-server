import { Injectable } from '@nestjs/common';
import {
  CacheCategoryRepository,
  PublicCategoriesWithID,
} from '@product/domain/ports/secondary/cache-category-repository.port';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import CacheTime from '@product/domain/constants/cache-time';

const EMPTY_PAGE_MARKER = '__empty__';

@Injectable()
export default class RedisCacheCategoryRepository implements CacheCategoryRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getCategories(cursor: string): Promise<PublicCategoriesWithID | null> {
    const categoryCursorKey = `category-cursor:${cursor}`;
    const categoryKeys = await this.redis.smembers(categoryCursorKey);

    if (categoryKeys.length === 0) return null;

    if (categoryKeys.length === 1 && categoryKeys[0] === EMPTY_PAGE_MARKER) {
      return [];
    }

    const pipeline = this.redis.pipeline();
    categoryKeys.forEach((key) => pipeline.get(key));
    const results = await pipeline.exec();

    const categoriesWithId = results
      .filter(([err, value]) => !err && value !== null)
      .map(([, value]) => JSON.parse(value as string))
      .sort((left, right) => left.id - right.id);

    return categoriesWithId;
  }

  async add(cursor: string, categories: PublicCategoriesWithID): Promise<void> {
    const categoryPageKey = `category-cursor:${cursor}`;
    const pipeline = this.redis.pipeline();

    if (categories.length === 0) {
      pipeline.sadd(categoryPageKey, EMPTY_PAGE_MARKER);
      pipeline.expire(categoryPageKey, CacheTime.categorySeconds);
      await pipeline.exec();
      return;
    }

    categories.forEach((category) => {
      const categoryKey = `category:${category.publicID}`;

      pipeline.set(categoryKey, JSON.stringify(category));
      pipeline.sadd(categoryPageKey, categoryKey);
      pipeline.expire(categoryKey, CacheTime.categorySeconds); // 30 min
    });

    pipeline.expire(categoryPageKey, CacheTime.categorySeconds);

    await pipeline.exec();
  }

  async removeByPublicID(id: string): Promise<void> {
    const categoryKey = `category:${id}`;
    await this.redis.del(categoryKey);

    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        'category-cursor:*',
        'COUNT',
        200,
      );

      if (keys.length > 0) {
        const pipeline = this.redis.pipeline();
        keys.forEach((key) => pipeline.srem(key, categoryKey));
        await pipeline.exec();
      }

      cursor = nextCursor;
    } while (cursor !== '0');
  }

  async invalidateAll(): Promise<void> {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        'category-*',
        'COUNT',
        200,
      );

      if (keys.length > 0) {
        const pipeline = this.redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
      }

      cursor = nextCursor;
    } while (cursor !== '0');
  }
}
