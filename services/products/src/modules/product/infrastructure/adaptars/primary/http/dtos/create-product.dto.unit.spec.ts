import {
  TitleConstants,
  PriceConstants,
  DescriptionConstants,
  OverviewConstants,
  PhotosConstants,
  PaymentsConstants,
  ActiveConstants,
  StockConstants,
  CategoryConstants,
} from '@product/domain/values-objects/constants';
import { ValidationObjectFactory } from '@product/infrastructure/helpers/dto-helper';
import { ProductDTOFactory } from '@product/infrastructure/helpers/factories/product-factory';
import CreateProductDTO from './create-product.dto';

describe('CreateProductDTO', () => {
  it('should success validation when all fields are valid', async () => {
    const errors = await ValidationObjectFactory.validateObject(
      ProductDTOFactory.createProductDTOLikeInstance(),
    );
    expect(errors).toHaveLength(0);
  });

  it('should return error when any field is undefined', async () => {
    const requiredFields: Record<keyof CreateProductDTO, string> = {
      title: TitleConstants.ERROR_REQUIRED,
      price: PriceConstants.ERROR_REQUIRED,
      description: DescriptionConstants.ERROR_REQUIRED,
      overview: OverviewConstants.ERROR_REQUIRED,
      photos: PhotosConstants.ERROR_REQUIRED,
      payments: PaymentsConstants.ERROR_REQUIRED,
      active: ActiveConstants.ERROR_REQUIRED,
      stock: StockConstants.ERROR_REQUIRED,
      categoryID: CategoryConstants.ERROR_REQUIRED,
    };

    for (const [key, message] of Object.entries(requiredFields)) {
      const dto = ProductDTOFactory.createProductDTOLikeInstance(
        {},
        key as keyof CreateProductDTO,
      );

      const errors = await ValidationObjectFactory.validateObject(dto);

      expect(errors.length).toBeGreaterThan(0);

      const fieldError = errors.find((err) => err.property === key);

      expect(fieldError).toBeDefined();
      expect(fieldError?.property).toBe(key);
      expect(fieldError?.constraints?.isNotEmpty).toBe(message);
    }
  });
});
