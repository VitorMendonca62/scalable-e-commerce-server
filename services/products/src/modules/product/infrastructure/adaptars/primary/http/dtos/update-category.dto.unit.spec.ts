import CategorySlugConstants from '@product/domain/values-objects/category/slug/slug.constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { CategoryDTOFactory } from '@product/infrastructure/helpers/factories/category-factory';

describe('UpdateCategoryDTO', () => {
  it('should success validation when all fields are undefined (partial update)', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CategoryDTOFactory.createUpdateCategoryDTO(),
    );

    expect(errors).toHaveLength(0);
  });

  it('should success validation when only name is provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CategoryDTOFactory.createUpdateCategoryDTO({
        name: 'Nova Categoria',
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it('should success validation when only slug is provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CategoryDTOFactory.createUpdateCategoryDTO({
        slug: 'nova-categoria',
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it('should return error when slug format is invalid', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CategoryDTOFactory.createUpdateCategoryDTO({
        slug: CategorySlugConstants.ERROR_INVALID_FORMAT_EXEMPLE,
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((err) => err.property === 'slug');
    expect(fieldError?.constraints?.matches).toBe(
      CategorySlugConstants.ERROR_INVALID_FORMAT,
    );
  });
});
