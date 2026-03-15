import { CategoryConstants } from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';

describe('Category Decorator', () => {
  it('should success validation when category is valid UUID', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      categoryID: CategoryConstants.EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const categoryError = errors.find((err) => err.property === 'categoryID');

    expect(categoryError).toBeUndefined();
  });

  it('should return error when category is empty', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      categoryID: CategoryConstants.ERROR_REQUIRED_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'categoryID');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isNotEmpty).toBe(
      CategoryConstants.ERROR_REQUIRED,
    );
  });

  it('should return error when category is not string', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      categoryID: CategoryConstants.ERROR_STRING_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'categoryID');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isString).toBe(
      CategoryConstants.ERROR_STRING,
    );
  });

  it('should return error when category is not valid UUID', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      categoryID: CategoryConstants.ERROR_INVALID_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'categoryID');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isUuid).toBe(
      CategoryConstants.ERROR_INVALID,
    );
  });

  it('should accept valid UUID v4', async () => {
    const validUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      '019c59b2-4485-75df-9163-c8ee30336b87',
    ];

    for (const uuid of validUUIDs) {
      const dto = ProductDTOFactory.createProductDTOLikeInstance({
        categoryID: uuid,
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors.find((err) => err.property === 'categoryID');

      expect(fieldError).toBeUndefined();
    }
  });

  it('should reject invalid UUID formats', async () => {
    const invalidUUIDs = [
      'not-a-uuid',
      '123456',
      'abc-def-ghi',
      '550e8400-e29b-41d4-a716',
      '550e8400e29b41d4a716446655440000', // sem hífens
    ];

    for (const uuid of invalidUUIDs) {
      const dto = ProductDTOFactory.createProductDTOLikeInstance({
        categoryID: uuid,
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors.find((err) => err.property === 'categoryID');

      expect(fieldError).toBeDefined();
    }
  });

  it('should handle undefined category', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance(
      {},
      'categoryID',
    );

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'categoryID');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isNotEmpty).toBe(
      CategoryConstants.ERROR_REQUIRED,
    );
  });
});
