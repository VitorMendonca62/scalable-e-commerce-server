import ProductRepository from '@product/domain/ports/secondary/product-repository.port';
import ProductModel from '../models/product.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export default class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductModel)
    private productRepository: Repository<ProductModel>,
  ) {}

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
