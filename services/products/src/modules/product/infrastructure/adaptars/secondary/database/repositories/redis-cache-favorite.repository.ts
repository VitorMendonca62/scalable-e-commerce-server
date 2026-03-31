import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import CacheTime from '@product/domain/constants/cache-time';
import { CacheFavoritesRepository } from '@product/domain/ports/secondary/cache-favorite-repository.port';

@Injectable()
export default class RedisCacheFavoriteRepository implements CacheFavoritesRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async isFavorite(userID: string, productID: string): Promise<boolean | null> {
    const key = this.buildKey(userID);
    const exists = await this.redis.exists(key);

    if (exists === 0) return null;

    const isMember = await this.redis.sismember(key, productID);
    return isMember === 1;
  }

  async addFavorite(userID: string, productID: string): Promise<void> {
    const key = this.buildKey(userID);
    await this.redis
      .pipeline()
      .sadd(key, productID)
      .expire(key, CacheTime.favoriteSeconds)
      .exec();
  }

  async removeFavorite(userID: string, productID: string): Promise<void> {
    const key = this.buildKey(userID);
    await this.redis
      .pipeline()
      .srem(key, productID)
      .expire(key, CacheTime.favoriteSeconds)
      .exec();
  }

  private buildKey(userID: string): string {
    return `favorite:user:${userID}`;
  }
}
