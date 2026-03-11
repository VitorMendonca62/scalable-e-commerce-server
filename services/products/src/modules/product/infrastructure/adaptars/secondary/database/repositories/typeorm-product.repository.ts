import ProductRepository from '@product/domain/ports/secondary/product-repository.port';
import ProductModel from '../models/product.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export default class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductRepository)
    private productReposiory: Repository<ProductModel>,
  ) {}

  getOne(
    fields: Partial<Pick<ProductModel, 'id' | 'publicID'>>,
  ): Promise<ProductModel | null> {
    return this.productReposiory.findOne({
      where: fields,
      select: { id: false },
    });
  }

  async add(
    product: Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    await this.productReposiory.save(product);
  }
}
