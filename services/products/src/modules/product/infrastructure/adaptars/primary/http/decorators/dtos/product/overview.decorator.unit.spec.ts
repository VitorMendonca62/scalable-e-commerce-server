import { OverviewConstants } from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';

describe('Overview Decorator', () => {
  it('should success validation when overview is valid', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      overview: OverviewConstants.EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const overviewError = errors.find((err) => err.property === 'overview');

    expect(overviewError).toBeUndefined();
  });

  it('should return error when overview is empty', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      overview: OverviewConstants.ERROR_REQUIRED_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'overview');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isNotEmpty).toBe(
      OverviewConstants.ERROR_REQUIRED,
    );
  });

  it('should return error when overview is not string', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      overview: OverviewConstants.ERROR_STRING_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'overview');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isString).toBe(
      OverviewConstants.ERROR_STRING,
    );
  });

  it('should return error when overview is too short', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      overview: OverviewConstants.ERROR_MIN_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'overview');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.minLength).toBe(
      OverviewConstants.ERROR_MIN_LENGTH,
    );
  });

  it('should return error when overview is too long', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      overview: OverviewConstants.ERROR_MAX_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'overview');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.maxLength).toBe(
      OverviewConstants.ERROR_MAX_LENGTH,
    );
  });

  it('should accept overview at minimum length (10 chars)', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      overview: 'a'.repeat(10),
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'overview');

    expect(fieldError).toBeUndefined();
  });

  it('should accept overview at maximum length (500 chars)', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      overview: 'a'.repeat(500),
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'overview');

    expect(fieldError).toBeUndefined();
  });

  it('should handle undefined overview', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({}, 'overview');

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'overview');

    expect(fieldError).toBeDefined();
  });
});
