import {
  TitleConstants,
  PriceConstants,
  DescriptionConstants,
  OverviewConstants,
  PhotosConstants,
  PaymentsConstants,
  StockConstants,
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
});
