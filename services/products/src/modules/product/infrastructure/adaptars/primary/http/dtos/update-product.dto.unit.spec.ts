import {
  TitleConstants,
  PriceConstants,
  DescriptionConstants,
  OverviewConstants,
  PhotosConstants,
  PaymentsConstants,
  StockConstants,
  ActiveConstants,
} from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';
describe('UpdateProductDTO', () => {
  it('should success validation when all fields are valid', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      ProductDTOFactory.createUpdateProductDTO({
        title: TitleConstants.EXEMPLE,
        price: PriceConstants.EXEMPLE,
        description: DescriptionConstants.EXEMPLE,
        overview: OverviewConstants.EXEMPLE,
        photos: PhotosConstants.EXEMPLE,
        payments: PaymentsConstants.EXEMPLE,
        active: true,
        stock: StockConstants.EXEMPLE,
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should success validation when all fields are undefined (partial update)', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      ProductDTOFactory.createUpdateProductDTO(),
    );
    expect(errors).toHaveLength(0);
  });

  it('should success validation when only title is provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      ProductDTOFactory.createUpdateProductDTO({
        title: TitleConstants.EXEMPLE,
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should success validation when only price is provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      ProductDTOFactory.createUpdateProductDTO({
        price: PriceConstants.EXEMPLE,
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should success validation when only some fields are provided', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      ProductDTOFactory.createUpdateProductDTO({
        title: TitleConstants.EXEMPLE,
        stock: 100,
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should return error when string fields are not string', async () => {
    const requiredFields = {
      title: TitleConstants.ERROR_STRING,
      description: DescriptionConstants.ERROR_STRING,
      overview: OverviewConstants.ERROR_STRING,
    };

    Object.entries(requiredFields).forEach(async (field) => {
      const [key, message] = field;
      const dto = ProductDTOFactory.createUpdateProductDTO({
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
      const dto = ProductDTOFactory.createUpdateProductDTO({
        [key]: 'not-a-number',
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.isNumber).toBe(message);
    });
  });

  it('should return error when active is not boolean', async () => {
    const dto = ProductDTOFactory.createUpdateProductDTO({
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
      const dto = ProductDTOFactory.createUpdateProductDTO({
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
      const dto = ProductDTOFactory.createUpdateProductDTO({
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
      const dto = ProductDTOFactory.createUpdateProductDTO({
        [key]: 'a'.repeat(10000),
      });

      const errors = await ValidationObjectFactory.validateObject(dto);
      const fieldError = errors[0];

      expect(fieldError.constraints.maxLength).toBe(message);
    });
  });

  it('should return error when price is not integer', async () => {
    const dto = ProductDTOFactory.createUpdateProductDTO({
      price: PriceConstants.ERROR_INTEGER_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isInt).toBe(PriceConstants.ERROR_INTEGER);
  });

  it('should return error when stock is not integer', async () => {
    const dto = ProductDTOFactory.createUpdateProductDTO({
      stock: StockConstants.ERROR_INTEGER_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.isInt).toBe(StockConstants.ERROR_INTEGER);
  });

  it('should return error when price is less than minimum value', async () => {
    const dto = ProductDTOFactory.createUpdateProductDTO({
      price: PriceConstants.ERROR_MIN_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.min).toBe(PriceConstants.ERROR_MIN_VALUE);
  });

  it('should return error when price is greater than maximum value', async () => {
    const dto = ProductDTOFactory.createUpdateProductDTO({
      price: PriceConstants.ERROR_MAX_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.max).toBe(PriceConstants.ERROR_MAX_VALUE);
  });

  it('should return error when stock is less than minimum value', async () => {
    const dto = ProductDTOFactory.createUpdateProductDTO({
      stock: StockConstants.ERROR_MIN_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.min).toBe(StockConstants.ERROR_MIN_VALUE);
  });

  it('should return error when stock is greater than maximum value', async () => {
    const dto = ProductDTOFactory.createUpdateProductDTO({
      stock: StockConstants.ERROR_MAX_VALUE_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.max).toBe(StockConstants.ERROR_MAX_VALUE);
  });

  it('should return error when photos array is empty', async () => {
    const dto = ProductDTOFactory.createUpdateProductDTO({
      photos: PhotosConstants.ERROR_MIN_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.arrayMinSize).toBe(
      PhotosConstants.ERROR_MIN_LENGTH,
    );
  });

  it('should return error when photos array exceeds maximum size', async () => {
    const dto = ProductDTOFactory.createUpdateProductDTO({
      photos: PhotosConstants.ERROR_MAX_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.arrayMaxSize).toBe(
      PhotosConstants.ERROR_MAX_LENGTH,
    );
  });

  it('should return error when payments array is empty', async () => {
    const dto = ProductDTOFactory.createUpdateProductDTO({
      payments: PaymentsConstants.ERROR_MIN_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors[0];

    expect(fieldError.constraints.arrayMinSize).toBe(
      PaymentsConstants.ERROR_MIN_LENGTH,
    );
  });

  it('should validate correctly when updating only active status', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      ProductDTOFactory.createUpdateProductDTO({
        active: false,
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('should validate correctly when updating only stock to zero', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      ProductDTOFactory.createUpdateProductDTO({
        stock: 0,
      }),
    );
    expect(errors).toHaveLength(0);
  });
});
