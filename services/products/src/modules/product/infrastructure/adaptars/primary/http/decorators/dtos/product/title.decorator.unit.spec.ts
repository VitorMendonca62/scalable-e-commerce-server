import { TitleConstants } from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';

describe('Title Decorator', () => {
  it('should success validation when title is valid', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      title: TitleConstants.EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const titleError = errors.find((err) => err.property === 'title');

    expect(titleError).toBeUndefined();
  });

  it('should return error when title is empty', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      title: TitleConstants.ERROR_REQUIRED_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'title');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isNotEmpty).toBe(
      TitleConstants.ERROR_REQUIRED,
    );
  });

  it('should return error when title is not string', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      title: TitleConstants.ERROR_STRING_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'title');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isString).toBe(TitleConstants.ERROR_STRING);
  });

  it('should return error when title is too short', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      title: TitleConstants.ERROR_MIN_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'title');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.minLength).toBe(
      TitleConstants.ERROR_MIN_LENGTH,
    );
  });

  it('should return error when title is too long', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      title: TitleConstants.ERROR_MAX_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'title');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.maxLength).toBe(
      TitleConstants.ERROR_MAX_LENGTH,
    );
  });

  it('should accept title at minimum length (3 chars)', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      title: 'abc',
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'title');

    expect(fieldError).toBeUndefined();
  });

  it('should accept title at maximum length (200 chars)', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      title: 'a'.repeat(200),
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'title');

    expect(fieldError).toBeUndefined();
  });

  it('should handle undefined title', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({}, 'title');

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'title');

    expect(fieldError).toBeDefined();
  });
});
