import ProductEntity from '@product/domain/entities/product.entity';
import CreateProductDTO from '../adaptars/primary/http/dtos/create-product.dto';
import { Injectable } from '@nestjs/common';
import ProductModel from '../adaptars/secondary/database/models/product.model';

@Injectable()
export default class ProductMapper {
  createDTOForEntity(dto: CreateProductDTO, userID: string): ProductEntity {
    return new ProductEntity({
      active: dto.active,
      description: dto.description,
      payments: dto.payments,
      photos: dto.photos,
      price: dto.price,
      overview: dto.overview,
      stock: dto.stock,
      title: dto.title,
      owner: userID,
    });
  }

  entityForModel(
    entity: ProductEntity,
  ): Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      title: entity.title,
      price: entity.price,
      overview: entity.overview,
      description: entity.description,
      photos: entity.photos,
      payments: entity.payments,
      active: entity.active,
      stock: entity.stock,
      owner: entity.owner,
    };
  }
}
