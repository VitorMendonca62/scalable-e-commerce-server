import RatingRepository from '@product/domain/ports/secondary/rating-repository.port';
import ProductRatingModel from '../models/rating.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export default class TypeOrmRatingRepository implements RatingRepository {
  constructor(
    @InjectRepository(ProductRatingModel)
    private ratingRepository: Repository<ProductRatingModel>,
  ) {}

  async create(
    newRating: Omit<
      ProductRatingModel,
      'id' | 'createdAt' | 'updatedAt' | 'product'
    >,
  ): Promise<void> {
    const rating = this.ratingRepository.create(newRating);

    await this.ratingRepository.save(rating);
  }

  async update(
    productID: string,
    userID: string,
    updates: Partial<ProductRatingModel>,
  ): Promise<boolean> {
    return (
      (await this.ratingRepository.update({ productID, userID }, updates))
        .affected >= 1
    );
  }

  async exists(productID: string, userID: string): Promise<boolean> {
    return this.ratingRepository.exists({ where: { productID, userID } });
  }
}
