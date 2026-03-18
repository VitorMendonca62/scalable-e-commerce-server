import CategoryEntity from '@product/domain/entities/category.entity';
import CategoryNameConstants from '@product/domain/values-objects/category/name/name.constants';
import CategorySlugConstants from '@product/domain/values-objects/category/slug/slug.constants';
import {
  IDConstants,
  ActiveConstants,
} from '@product/domain/values-objects/constants';
import CreateCategoryDTO from '@product/infrastructure/adaptars/primary/http/dtos/create-category.dto';
import UpdateCategoryDTO from '@product/infrastructure/adaptars/primary/http/dtos/update-category.dto';
import CategoryModel from '@product/infrastructure/adaptars/secondary/database/models/categories.model';

export class CategoryFactory {
  static createEntity(overrides?: Partial<CategoryEntity>): CategoryEntity {
    return new CategoryEntity({
      publicID: IDConstants.EXEMPLE,
      name: CategoryNameConstants.EXEMPLE,
      slug: CategorySlugConstants.EXEMPLE,
      active: ActiveConstants.EXEMPLE,
      ...overrides,
    });
  }

  static createModel(overrides?: Partial<CategoryModel>): CategoryModel {
    const model = new CategoryModel();
    model.id = 1;
    model.publicID = IDConstants.EXEMPLE;
    model.name = CategoryNameConstants.EXEMPLE;
    model.slug = CategorySlugConstants.EXEMPLE;
    model.active = true;
    model.createdAt = new Date();
    model.updatedAt = new Date();

    return Object.assign(model, overrides);
  }
}

export class CategoryDTOFactory {
  static createCategoryDTOLikeInstance(
    overrides?: Partial<CreateCategoryDTO>,
    undefinedField?: keyof CreateCategoryDTO,
  ): CreateCategoryDTO {
    const dto = new CreateCategoryDTO();

    if (undefinedField !== 'name')
      dto.name = overrides?.name ?? CategoryNameConstants.EXEMPLE;

    if (undefinedField !== 'slug')
      dto.slug = overrides?.slug ?? CategorySlugConstants.EXEMPLE;

    if (undefinedField !== 'active') dto.active = overrides?.active ?? true;

    return dto;
  }

  static createUpdateCategoryDTO(
    overrides?: Partial<UpdateCategoryDTO>,
  ): UpdateCategoryDTO {
    const dto = new UpdateCategoryDTO();

    if (overrides?.name !== undefined) dto.name = overrides.name;
    if (overrides?.slug !== undefined) dto.slug = overrides.slug;
    if (overrides?.active !== undefined) dto.active = overrides.active;

    return dto;
  }
}
