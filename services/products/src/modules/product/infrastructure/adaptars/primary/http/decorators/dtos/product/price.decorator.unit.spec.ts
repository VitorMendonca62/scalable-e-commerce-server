import { PriceConstants } from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';

describe('Price Decorator', () => {
  it('should success validation when price is valid', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      price: PriceConstants.EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const priceError = errors.find((err) => err.property === 'price');

    expect(priceError).toBeUndefined();
  });

  it('should return error when price is not number', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      price: PriceConstants.ERROR_NUMBER_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'price');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isNumber).toBe(PriceConstants.ERROR_NUMBER);
  });

  it('should return error when price is not integer', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      price: PriceConstants.ERROR_INTEGER_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'price');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isInt).toBe(PriceConstants.ERROR_INTEGER);
  });

  it('should return error when price is less than minimum', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      price: PriceConstants.ERROR_MIN_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'price');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.min).toBe(PriceConstants.ERROR_MIN_VALUE);
  });

  it('should return error when price exceeds maximum', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      price: PriceConstants.ERROR_MAX_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'price');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.max).toBe(PriceConstants.ERROR_MAX_VALUE);
  });

  it('should accept minimum valid price (1)', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      price: 1,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'price');

    expect(fieldError).toBeUndefined();
  });

  it('should accept maximum valid price', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      price: PriceConstants.MAX_VALUE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'price');

    expect(fieldError).toBeUndefined();
  });

  it('should handle undefined price', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({}, 'price');

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'price');

    expect(fieldError).toBeDefined();
  });
});
