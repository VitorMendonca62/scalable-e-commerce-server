import ProductEntity from '@product/domain/entities/product.entity';
import {
  TitleConstants,
  PriceConstants,
  DescriptionConstants,
  PhotosConstants,
  PaymentsConstants,
  IDConstants,
  ActiveConstants,
  StockConstants,
  OverviewConstants,
} from '@product/domain/values-objects/constants';
import CreateProductDTO from '../../adaptars/primary/http/dtos/create-product.dto';
import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';

export class ProductFactory {
  static createDTO(overrides?: Partial<CreateProductDTO>): CreateProductDTO {
    return {
      title: TitleConstants.EXEMPLE,
      price: PriceConstants.EXEMPLE,
      description: DescriptionConstants.EXEMPLE,
      photos: PhotosConstants.EXEMPLE,
      payments: PaymentsConstants.EXEMPLE,
      overview: OverviewConstants.EXEMPLE,
      active: true,
      stock: 50,
      ...overrides,
    };
  }

  static createEntity(
    overrides?: Partial<ProductEntity>,
    owner?: string,
  ): ProductEntity {
    return new ProductEntity({
      title: TitleConstants.EXEMPLE,
      price: PriceConstants.EXEMPLE,
      description: DescriptionConstants.EXEMPLE,
      photos: PhotosConstants.EXEMPLE,
      payments: PaymentsConstants.EXEMPLE,
      active: ActiveConstants.EXEMPLE,
      overview: OverviewConstants.EXEMPLE,
      stock: StockConstants.EXEMPLE,
      owner: owner || IDConstants.EXEMPLE,
      ...overrides,
    });
  }

  static createModel(overrides?: Partial<ProductModel>): ProductModel {
    const model = new ProductModel();

    model.id = IDConstants.EXEMPLE;
    model.title = TitleConstants.EXEMPLE;
    model.price = PriceConstants.EXEMPLE;
    model.description = DescriptionConstants.EXEMPLE;
    model.overview = OverviewConstants.EXEMPLE;
    model.photos = PhotosConstants.EXEMPLE;
    model.payments = PaymentsConstants.EXEMPLE;
    model.active = true;
    model.stock = 50;
    model.owner = IDConstants.EXEMPLE;
    model.createdAt = new Date();
    model.updatedAt = new Date();

    return Object.assign(model, overrides);
  }
}

export class ProductDTOFactory {
  static createProductDTOLikeInstance(
    overrides?: Partial<CreateProductDTO>,
  ): CreateProductDTO {
    const dto = new CreateProductDTO();

    dto.title = overrides?.title ?? TitleConstants.EXEMPLE;
    dto.price = overrides?.price ?? PriceConstants.EXEMPLE;
    dto.description = overrides?.description ?? DescriptionConstants.EXEMPLE;
    dto.overview = overrides?.overview ?? OverviewConstants.EXEMPLE;
    dto.photos = overrides?.photos ?? PhotosConstants.EXEMPLE;
    dto.payments = overrides?.payments ?? PaymentsConstants.EXEMPLE;
    dto.active = overrides?.active ?? true;
    dto.stock = overrides?.stock ?? StockConstants.EXEMPLE;

    return dto;
  }
}
