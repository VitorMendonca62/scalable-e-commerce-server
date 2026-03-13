import FavoriteRepository from '@product/domain/ports/secondary/favorite-repository.port';
import ProductFavoriteModel from '../models/favorite.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export default class TypeOrmFavoriteRepository implements FavoriteRepository {
  constructor(
    @InjectRepository(ProductFavoriteModel)
    private favoriteRepository: Repository<ProductFavoriteModel>,
  ) {}

  async favorite(productID: string, userID: string): Promise<void> {
    const favorite = this.favoriteRepository.create({
      userID,
      productID,
    });

    this.favoriteRepository.save(favorite).catch();
  }

  async unfavorite(productID: string, userID: string): Promise<boolean> {
    return (
      (await this.favoriteRepository.delete({ userID, productID })).affected !=
      0
    );
  }

  async isFavorite(productID: string, userID: string): Promise<boolean> {
    return await this.favoriteRepository.exists({
      where: { userID, productID },
    });
  }
}
