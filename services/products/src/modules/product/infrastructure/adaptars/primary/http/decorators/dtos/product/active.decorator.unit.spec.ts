import { ActiveConstants } from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';

describe('Active Decorator', () => {
  it('should success validation when active is true', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      active: true,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const activeError = errors.find((err) => err.property === 'active');

    expect(activeError).toBeUndefined();
  });

  it('should success validation when active is false', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      active: false,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const activeError = errors.find((err) => err.property === 'active');

    expect(activeError).toBeUndefined();
  });

  it('should return error when active is not boolean', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      active: ActiveConstants.ERROR_BOOLEAN_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'active');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isBoolean).toBe(
      ActiveConstants.ERROR_BOOLEAN,
    );
  });

  it('should aprove string "true"', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      active: 'true' as any,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'active');
    expect(fieldError).toBeUndefined();
  });

  it('should aprove string "false"', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      active: 'false' as any,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'active');

    expect(fieldError).toBeUndefined();
  });

  it('should reject number 1', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      active: 1 as any,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'active');

    expect(fieldError).toBeDefined();
  });

  it('should reject number 0', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      active: 0 as any,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'active');

    expect(fieldError).toBeDefined();
  });

  it('should handle undefined active', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({}, 'active');

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'active');

    expect(fieldError).toBeDefined();
  });
});
