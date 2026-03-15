import { PhotosConstants } from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';

describe('Photos Decorator', () => {
  it('should success validation when photos is valid array of strings', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: PhotosConstants.EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const photosError = errors.find((err) => err.property === 'photos');

    expect(photosError).toBeUndefined();
  });

  it('should return error when photos is not array', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: PhotosConstants.ERROR_ARRAY_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'photos');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.isArray).toBe(PhotosConstants.ERROR_ARRAY);
  });

  it('should return error when photos array is empty', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: PhotosConstants.ERROR_MIN_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'photos');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.arrayMinSize).toBe(
      PhotosConstants.ERROR_MIN_LENGTH,
    );
  });

  it('should return error when photos array exceeds maximum', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: PhotosConstants.ERROR_MAX_LENGTH_EXEMPLE,
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'photos');

    expect(fieldError).toBeDefined();
    expect(fieldError?.constraints?.arrayMaxSize).toBe(
      PhotosConstants.ERROR_MAX_LENGTH,
    );
  });

  it('should accept single photo as base64 string', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: [
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      ],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'photos');

    expect(fieldError).toBeUndefined();
  });

  it('should accept multiple photos as base64 strings', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: [
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      ],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'photos');

    expect(fieldError).toBeUndefined();
  });

  it('should accept maximum number of photos (10)', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: Array(10).fill(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      ),
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'photos');

    expect(fieldError).toBeUndefined();
  });

  it('should transform Buffer to base64 string', async () => {
    const buffer = Buffer.from('test image data');
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: [buffer] as any,
    });

    await ValidationObjectFactory.validateObject(dto);

    expect(dto.photos[0]).toBe(buffer.toString('base64'));
  });

  it('should keep string values unchanged during transformation', async () => {
    const base64String =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: [base64String],
    });

    await ValidationObjectFactory.validateObject(dto);

    expect(dto.photos[0]).toBe(base64String);
  });

  it('should transform mixed array of Buffers and strings', async () => {
    const buffer1 = Buffer.from('image1');
    const base64String = 'existingBase64String';
    const buffer2 = Buffer.from('image2');

    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: [buffer1, base64String, buffer2] as any,
    });

    await ValidationObjectFactory.validateObject(dto);

    expect(dto.photos[0]).toBe(buffer1.toString('base64'));
    expect(dto.photos[1]).toBe(base64String);
    expect(dto.photos[2]).toBe(buffer2.toString('base64'));
  });

  it('should handle undefined photos', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({}, 'photos');

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'photos');

    expect(fieldError).toBeDefined();
  });

  it('should accept array with single base64 photo at minimum length', async () => {
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: ['dGVzdA=='],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'photos');

    expect(fieldError).toBeUndefined();
  });

  it('should handle long base64 strings', async () => {
    const longBase64 = 'A'.repeat(10000);
    const dto = ProductDTOFactory.createProductDTOLikeInstance({
      photos: [longBase64],
    });

    const errors = await ValidationObjectFactory.validateObject(dto);
    const fieldError = errors.find((err) => err.property === 'photos');

    expect(fieldError).toBeUndefined();
  });
});
