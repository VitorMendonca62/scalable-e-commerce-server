import { Injectable } from '@nestjs/common';
import RatingEntity from '@product/domain/entities/rating.entity';
import ProductRatingModel from '../adaptars/secondary/database/models/rating.model';
import CreateRatingDTO from '../adaptars/primary/http/dtos/create-rating.dto';
import UpdateRatingDTO from '../adaptars/primary/http/dtos/update-rating.dto';

@Injectable()
export default class RatingMapper {
  createDTOForEntity(
    dto: CreateRatingDTO,
    productID: string,
    userID: string,
  ): RatingEntity {
    return new RatingEntity({
      productID,
      userID,
      value: dto.value,
      comment: dto.comment,
      images: dto.images,
    });
  }

  entityForModel(
    entity: RatingEntity,
  ): Omit<ProductRatingModel, 'id' | 'createdAt' | 'updatedAt' | 'product'> {
    return {
      productID: entity.productID,
      userID: entity.userID,
      value: entity.value,
      comment: entity.comment,
      images: entity.images,
    };
  }

  updateDTOToModelPartial(dto: UpdateRatingDTO): Partial<ProductRatingModel> {
    const partial: Partial<ProductRatingModel> = {};

    if (dto.value !== undefined) {
      partial.value = dto.value;
    }

    if (dto.comment !== undefined) {
      partial.comment = dto.comment;
    }

    if (dto.images !== undefined) {
      partial.images = dto.images;
    }

    return partial;
  }
}
