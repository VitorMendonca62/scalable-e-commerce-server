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
      where: whereFilters,
      select: { id: false },
    });
  }

  getOne(
    fields: Partial<Pick<ProductModel, 'id' | 'publicID'>>,
  ): Promise<ProductModel | null> {
    return this.productRepository.findOne({
      where: fields,
      select: { id: false },
    });
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
