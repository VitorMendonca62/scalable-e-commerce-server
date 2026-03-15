import { StockConstants } from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';

describe('Stock Decorator', () => {
  it('should success validation when stock is valid', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      stock: StockConstants.EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const stockError = errors.find((err) => err.property === 'stock');

    expect(stockError).toBeUndefined();
  });

  it('should return error when stock is not number', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      stock: StockConstants.ERROR_NUMBER_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'stock');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isNumber).toBe(StockConstants.ERROR_NUMBER);
  });

  it('should return error when stock is not integer', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      stock: StockConstants.ERROR_INTEGER_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'stock');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isInt).toBe(StockConstants.ERROR_INTEGER);
  });

  it('should return error when stock is negative', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      stock: StockConstants.ERROR_MIN_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'stock');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.min).toBe(StockConstants.ERROR_MIN_VALUE);
  });

  it('should return error when stock exceeds maximum', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      stock: StockConstants.ERROR_MAX_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'stock');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.max).toBe(StockConstants.ERROR_MAX_VALUE);
  });

  it('should accept zero stock', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      stock: 0,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'stock');

    expect(fieldError).toBeUndefined();
  });

  it('should accept maximum valid stock', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      stock: StockConstants.MAX_VALUE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'stock');

    expect(fieldError).toBeUndefined();
  });

  it('should handle undefined stock', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({}, 'stock');

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'stock');

    expect(fieldError).toBeDefined();
  });
});
