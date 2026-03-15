import { DescriptionConstants } from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';

describe('Description Decorator', () => {
  it('should success validation when description is valid', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      description: DescriptionConstants.EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const descriptionError = errors.find(
      (err) => err.property === 'description',
    );

    expect(descriptionError).toBeUndefined();
  });

  it('should return error when description is empty', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      description: DescriptionConstants.ERROR_REQUIRED_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'description');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isNotEmpty).toBe(
      DescriptionConstants.ERROR_REQUIRED,
    );
  });

  it('should return error when description is not string', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      description: DescriptionConstants.ERROR_STRING_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'description');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isString).toBe(
      DescriptionConstants.ERROR_STRING,
    );
  });

  it('should return error when description is too short', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      description: DescriptionConstants.ERROR_MIN_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'description');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.minLength).toBe(
      DescriptionConstants.ERROR_MIN_LENGTH,
    );
  });

  it('should return error when description is too long', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      description: DescriptionConstants.ERROR_MAX_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'description');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.maxLength).toBe(
      DescriptionConstants.ERROR_MAX_LENGTH,
    );
  });

  it('should accept description at minimum length', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      description: 'a'.repeat(10),
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'description');

    expect(fieldError).toBeUndefined();
  });

  it('should accept description at maximum length', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      description: 'a'.repeat(5000),
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'description');

    expect(fieldError).toBeUndefined();
  });

  it('should handle undefined description', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance(
      {},
      'description',
    );

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'description');

    expect(fieldError).toBeDefined();
  });
});
