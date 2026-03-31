import FavoriteRepository from '@product/domain/ports/secondary/favorite-repository.port';
import ProductFavoriteModel from '../models/favorite.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheFavoritesRepository } from '@product/domain/ports/secondary/cache-favorite-repository.port';

@Injectable()
export default class TypeOrmFavoriteRepository implements FavoriteRepository {
  constructor(
    @InjectRepository(ProductFavoriteModel)
    private favoriteRepository: Repository<ProductFavoriteModel>,
    private cacheFavoritesRepository: CacheFavoritesRepository,
  ) {}

  async favorite(productID: string, userID: string): Promise<void> {
    const favorite = this.favoriteRepository.create({
      userID,
      productID,
    });

    this.favoriteRepository.save(favorite).catch();
    await this.cacheFavoritesRepository.addFavorite(userID, productID);
  }

  async unfavorite(productID: string, userID: string): Promise<boolean> {
    const removed =
      (await this.favoriteRepository.delete({ userID, productID })).affected !=
      0;

    if (removed) {
      await this.cacheFavoritesRepository.removeFavorite(userID, productID);
    }

    return removed;
  }

  async isFavorite(productID: string, userID: string): Promise<boolean> {
    const cached = await this.cacheFavoritesRepository.isFavorite(
      userID,
      productID,
    );

    if (cached !== null) return cached;

    const isFavorite = await this.favoriteRepository.exists({
      where: { userID, productID },
    });

    if (isFavorite) {
      await this.cacheFavoritesRepository.addFavorite(userID, productID);
    } else {
      await this.cacheFavoritesRepository.removeFavorite(userID, productID);
    }

    return isFavorite;
  }
}
