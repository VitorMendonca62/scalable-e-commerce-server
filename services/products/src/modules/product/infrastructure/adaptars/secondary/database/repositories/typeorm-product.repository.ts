import ProductRepository from '@product/domain/ports/secondary/product-repository.port';
import ProductModel from '../models/product.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  ArrayContains,
} from 'typeorm';
import { ProductFilters } from '@product/domain/ports/application/get-products.port';
@Injectable()
export default class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductModel)
    private productRepository: Repository<ProductModel>,
  ) {}

  findWithFilters(filters: ProductFilters): Promise<ProductModel[]> {
    const whereFilters: FindOptionsWhere<ProductModel> = {};

    // TODO ADICIOINAR ISSO AQ
    // if (filters.category !== undefined) {
    //   whereFilters.push({
    //     category: In(filters.category),
    //   });
    // }

    if (filters.price !== undefined) {
      whereFilters.price = And(
        MoreThanOrEqual(filters.price.min),
        LessThanOrEqual(filters.price.max),
      );
    }

    if (filters.stock !== undefined) {
      whereFilters.stock = And(
        MoreThanOrEqual(filters.stock.min),
        LessThanOrEqual(filters.stock.max),
      );
    }

    if (filters.payments !== undefined) {
      whereFilters.payments = ArrayContains(filters.payments);
    }

    return this.productRepository.find({
      where: { ...whereFilters, active: true },
      select: { id: false },
    });
  }

  async getOne(
    publicID: string,
    userID: string,
  ): Promise<(Omit<ProductModel, 'id'> & { isFavorited: boolean }) | null> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .select()
      .where('product.active = :active AND product.publicID = :publicID', {
        active: true,
        publicID,
      });

    query
      .leftJoin(
        'product_favorites',
        'favorite',
        'favorite.product_id = product.public_id AND favorite.user_id = :userID',
        { userID },
      )
      .addSelect(
        'CASE WHEN favorite.id IS NOT NULL THEN true ELSE false END',
        'isFavorited',
      );

    const result = await query.getRawAndEntities();

    if (result.entities.length === 0) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...product } = result.entities[0];
    return {
      ...(product as Omit<ProductModel, 'id'>),
      isFavorited: result.raw[0].isFavorited,
    };
  }

  async add(
    product: Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    await this.productRepository.save(product);
  }

  async update(
    productID: string,
    userID: string,
    updates: Partial<ProductModel>,
  ): Promise<boolean> {
    return (
      (
        await this.productRepository.update(
          { publicID: productID, owner: userID },
          updates,
        )
      ).affected >= 1
    );
  }
}
