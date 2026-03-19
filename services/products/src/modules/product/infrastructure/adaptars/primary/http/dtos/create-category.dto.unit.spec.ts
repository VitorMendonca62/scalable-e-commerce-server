import CategoryActiveConstants from '@product/domain/values-objects/category/active/active.constants';
import CategoryNameConstants from '@product/domain/values-objects/category/name/name.constants';
import CategorySlugConstants from '@product/domain/values-objects/category/slug/slug.constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { CategoryDTOFactory } from '@product/infrastructure/helpers/factories/category-factory';
import CreateCategoryDTO from './create-category.dto';

describe('CreateCategoryDTO', () => {
  it('should success validation when all fields are valid', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CategoryDTOFactory.createCategoryDTOLikeInstance(),
    );

    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const requiredFields: Record<keyof CreateCategoryDTO, string> = {
      name: CategoryNameConstants.ERROR_REQUIRED,
      slug: CategorySlugConstants.ERROR_REQUIRED,
      active: CategoryActiveConstants.ERROR_REQUIRED,
    };

    for (const [key, message] of Object.entries(requiredFields)) {
      const dto = CategoryDTOFactory.createCategoryDTOLikeInstance(
        {},
        key as keyof CreateCategoryDTO,
      );

      const errors = await ValidationObjectFactory.validateObject(dto);

      expect(errors.length).toBeGreaterThan(0);

      const fieldError = errors.find((err) => err.property === key);

      expect(fieldError).toBeDefined();
      expect(fieldError?.property).toBe(key);
      expect(fieldError?.constraints?.isNotEmpty).toBe(message);
    }
  });

  it('should return error when slug format is invalid', async () => {
    const dto = CategoryDTOFactory.createCategoryDTOLikeInstance({
      slug: CategorySlugConstants.ERROR_INVALID_FORMAT_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'slug');
    expect(fieldError?.constraints?.matches).toBe(
      CategorySlugConstants.ERROR_INVALID_FORMAT,
    );
  });
});
