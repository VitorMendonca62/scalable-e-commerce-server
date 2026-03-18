import ProductEntity from '@product/domain/entities/product.entity';
import CreateProductDTO from '../adaptars/primary/http/dtos/create-product.dto';
import { Injectable } from '@nestjs/common';
import ProductModel from '../adaptars/secondary/database/models/product.model';
import { v7 } from 'uuid';
import UpdateProductDTO from '../adaptars/primary/http/dtos/update-product.dto';
@Injectable()
export default class ProductMapper {
  createDTOForEntity(dto: CreateProductDTO, userID: string): ProductEntity {
    return new ProductEntity({
      publicID: v7(),
      active: dto.active,
      description: dto.description,
      payments: dto.payments,
      photos: dto.photos,
      price: dto.price,
      overview: dto.overview,
      stock: dto.stock,
      title: dto.title,
      owner: userID,
      categoryID: dto.categoryID,
    });
  }

  entityForModel(
    entity: ProductEntity,
  ): Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt' | 'category'> {
    return {
      title: entity.title,
      publicID: entity.publicID,
      price: entity.price,
      overview: entity.overview,
      description: entity.description,
      photos: entity.photos,
      payments: entity.payments,
      active: entity.active,
      stock: entity.stock,
      owner: entity.owner,
      categoryID: entity.categoryID,
    };
  }

  updateDTOToEntityPartial(
    dto: UpdateProductDTO,
  ): Partial<Omit<ProductEntity, 'publicID' | 'owner'>> {
    const partial: Partial<Omit<ProductEntity, 'publicID' | 'owner'>> = {};

    if (dto.title !== undefined) {
      partial.title = dto.title;
    }

    if (dto.price !== undefined) {
      partial.price = dto.price;
    }

    if (dto.description !== undefined) {
      partial.description = dto.description;
    }

    if (dto.overview !== undefined) {
      partial.overview = dto.overview;
    }

    if (dto.photos !== undefined) {
      partial.photos = dto.photos;
    }

    if (dto.payments !== undefined) {
      partial.payments = dto.payments;
    }

    if (dto.active !== undefined) {
      partial.active = dto.active;
    }

    if (dto.stock !== undefined) {
      partial.stock = dto.stock;
    }

    if (dto.categoryID !== undefined) {
      partial.categoryID = dto.categoryID;
    }

    return partial;
  }
}
