import { Injectable } from '@nestjs/common';
import CategoryEntity from '@product/domain/entities/category.entity';
import { v7 } from 'uuid';
import CreateCategoryDTO from '../adaptars/primary/http/dtos/create-category.dto';
import UpdateCategoryDTO from '../adaptars/primary/http/dtos/update-category.dto';
import CategoryModel from '../adaptars/secondary/database/models/categories.model';

@Injectable()
export default class CategoryMapper {
  createDTOToEntity(dto: CreateCategoryDTO): CategoryEntity {
    return new CategoryEntity({
      publicID: v7(),
      name: dto.name,
      slug: dto.slug,
      active: dto.active,
    });
  }

  updateDTOToEntityPartial(
    id: string,
    dto: UpdateCategoryDTO,
  ): Partial<CategoryEntity> {
    const partial: Partial<CategoryEntity> = { publicID: id };

    if (dto.name !== undefined) {
      partial.name = dto.name;
    }

    if (dto.slug !== undefined) {
      partial.slug = dto.slug;
    }

    if (dto.active !== undefined) {
      partial.active = dto.active;
    }

    return partial;
  }
  entityToModel(
    entity: CategoryEntity,
  ): Omit<CategoryModel, 'id' | 'createdAt' | 'updatedAt' | 'products'> {
    return {
      publicID: entity.publicID,
      name: entity.name,
      slug: entity.slug,
      active: entity.active,
    };
  }
}
