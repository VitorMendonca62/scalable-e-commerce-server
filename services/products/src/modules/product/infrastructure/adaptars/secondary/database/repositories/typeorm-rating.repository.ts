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
    productID: string,
    userID: string,
    value: number,
  ): Promise<void> {
    const rating = this.ratingRepository.create({
      productID,
      userID,
      value,
    });

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
