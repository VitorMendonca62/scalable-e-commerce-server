import {
  TitleConstants,
  PriceConstants,
  DescriptionConstants,
  OverviewConstants,
  PhotosConstants,
  PaymentsConstants,
  ActiveConstants,
  StockConstants,
} from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';

describe('CreateProductDTO', () => {
  it('should success validation when all fields are valid', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      ProductDTOFactory.createProductDTOLikeInstance(),
    );
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is empty', async () => {
    const requiredFields = {
      title: TitleConstants.ERROR_REQUIRED,
      price: PriceConstants.ERROR_REQUIRED,
      description: DescriptionConstants.ERROR_REQUIRED,
      overview: OverviewConstants.ERROR_REQUIRED,
      photos: PhotosConstants.ERROR_REQUIRED,
      payments: PaymentsConstants.ERROR_REQUIRED,
      active: ActiveConstants.ERROR_REQUIRED,
      stock: StockConstants.ERROR_REQUIRED,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = ProductDTOFactory.createProductDTOLikeInstance({
        [key]: '',
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(errors).toHaveLength(1);
      expect(fieldError.value).toBe('');
      expect(fieldError.property).toBe(key);
      expect(fieldError.constraints.isNotEmpty).toBe(message);
    });
  });

  it('should return error when string fields are not string', async () => {
    const requiredFields = {
      title: TitleConstants.ERROR_STRING,
      description: DescriptionConstants.ERROR_STRING,
      overview: OverviewConstants.ERROR_STRING,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = ProductDTOFactory.createProductDTOLikeInstance({
        [key]: 12345,
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.isString).toBe(message);
    });
  });

  it('should return error when number fields are not number', async () => {
    const requiredFields = {
      price: PriceConstants.ERROR_NUMBER,
      stock: StockConstants.ERROR_NUMBER,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = ProductDTOFactory.createProductDTOLikeInstance({
        [key]: 'not-a-number',
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.isNumber).toBe(message);
    });
  });

  it('should return error when active is not boolean', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      active: ActiveConstants.ERROR_BOOLEAN_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isBoolean).toBe(
      ActiveConstants.ERROR_BOOLEAN,
    );
  });

  it('should return error when array fields are not array', async () => {
    const requiredFields = {
      photos: PhotosConstants.ERROR_ARRAY,
      payments: PaymentsConstants.ERROR_ARRAY,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = ProductDTOFactory.createProductDTOLikeInstance({
        [key]: 'not-an-array',
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.isArray).toBe(message);
    });
  });

  it('should return error when string fields are shorter than the allowed length', async () => {
    const requiredFields = {
      title: TitleConstants.ERROR_MIN_LENGTH,
      description: DescriptionConstants.ERROR_MIN_LENGTH,
      overview: OverviewConstants.ERROR_MIN_LENGTH,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = ProductDTOFactory.createProductDTOLikeInstance({
        [key]: 'ab',
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.minLength).toBe(message);
    });
  });

  it('should return error when string fields are bigger than the allowed length', async () => {
    const requiredFields = {
      title: TitleConstants.ERROR_MAX_LENGTH,
      description: DescriptionConstants.ERROR_MAX_LENGTH,
      overview: OverviewConstants.ERROR_MAX_LENGTH,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = ProductDTOFactory.createProductDTOLikeInstance({
        [key]: 'a'.repeat(10000),
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.maxLength).toBe(message);
    });
  });

  it('should return error when price is not integer', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      price: PriceConstants.ERROR_INTEGER_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isInt).toBe(PriceConstants.ERROR_INTEGER);
  });

  it('should return error when stock is not integer', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      stock: StockConstants.ERROR_INTEGER_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isInt).toBe(StockConstants.ERROR_INTEGER);
  });

  it('should return error when price is less than minimum value', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      price: PriceConstants.ERROR_MIN_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.min).toBe(PriceConstants.ERROR_MIN_VALUE);
  });

  it('should return error when price is greater than maximum value', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      price: PriceConstants.ERROR_MAX_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.max).toBe(PriceConstants.ERROR_MAX_VALUE);
  });

  it('should return error when stock is less than minimum value', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      stock: StockConstants.ERROR_MIN_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.min).toBe(StockConstants.ERROR_MIN_VALUE);
  });

  it('should return error when stock is greater than maximum value', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      stock: StockConstants.ERROR_MAX_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.max).toBe(StockConstants.ERROR_MAX_VALUE);
  });

  it('should return error when photos array is empty', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: PhotosConstants.ERROR_MIN_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.arrayMinSize).toBe(
      PhotosConstants.ERROR_MIN_LENGTH,
    );
  });

  it('should return error when photos array exceeds maximum size', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: PhotosConstants.ERROR_MAX_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.arrayMaxSize).toBe(
      PhotosConstants.ERROR_MAX_LENGTH,
    );
  });

  it('should return error when photos contain invalid URLs', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: PhotosConstants.ERROR_INVALID_URL_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isBase64).toBe(
      PhotosConstants.ERROR_INVALID_URL,
    );
  });

  it('should return error when payments array is empty', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      payments: PaymentsConstants.ERROR_MIN_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.arrayMinSize).toBe(
      PaymentsConstants.ERROR_MIN_LENGTH,
    );
  });
});
