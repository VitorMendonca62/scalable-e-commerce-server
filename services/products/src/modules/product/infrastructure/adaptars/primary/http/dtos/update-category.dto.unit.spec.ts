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

  it('should success validation when only active is provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CategoryDTOFactory.createUpdateCategoryDTO({
        active: false,
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it('should success validation when all fields is provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      CategoryDTOFactory.createUpdateCategoryDTO({
        name: 'Nova Categoria',
        active: true,
      }),
    );

    expect(errors).toHaveLength(0);
  });
});
