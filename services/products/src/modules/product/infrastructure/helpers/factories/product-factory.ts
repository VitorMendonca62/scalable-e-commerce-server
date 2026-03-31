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
  CategoryConstants,
} from '@product/domain/values-objects/constants';
import CreateProductDTO from '../../adaptars/primary/http/dtos/create-product.dto';
import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';
import UpdateProductDTO from '@product/infrastructure/adaptars/primary/http/dtos/update-product.dto';
import { CategoryFactory } from './category-factory';

export class ProductFactory {
  static createDTO(overrides?: Partial<CreateProductDTO>): CreateProductDTO {
    return {
      title: TitleConstants.EXEMPLE,
      price: PriceConstants.EXEMPLE,
      description: DescriptionConstants.EXEMPLE,
      photos: PhotosConstants.EXEMPLE,
      payments: PaymentsConstants.EXEMPLE,
      overview: OverviewConstants.EXEMPLE,
      categoryID: CategoryConstants.EXEMPLE,
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
      publicID: IDConstants.EXEMPLE,
      price: PriceConstants.EXEMPLE,
      description: DescriptionConstants.EXEMPLE,
      photos: PhotosConstants.EXEMPLE,
      payments: PaymentsConstants.EXEMPLE,
      active: ActiveConstants.EXEMPLE,
      overview: OverviewConstants.EXEMPLE,
      stock: StockConstants.EXEMPLE,
      owner: owner || IDConstants.EXEMPLE,
      categoryID: CategoryConstants.EXEMPLE,
      ...overrides,
    });
  }

  static createModel(
    overrides?: Partial<ProductModel>,
  ): ProductModel & { isFavorited: boolean; rating: number } {
    const model = new ProductModel();

    model.id = 1;
    model.publicID = IDConstants.EXEMPLE;
    model.title = TitleConstants.EXEMPLE;
    model.price = PriceConstants.EXEMPLE;
    model.description = DescriptionConstants.EXEMPLE;
    model.overview = OverviewConstants.EXEMPLE;
    model.photos = PhotosConstants.EXEMPLE;
    model.payments = PaymentsConstants.EXEMPLE;
    model.active = true;
    model.owner = IDConstants.EXEMPLE;
    model.stock = 50;
    model.createdAt = new Date();
    model.updatedAt = new Date();
    model.categoryID = IDConstants.EXEMPLE;
    model.category = CategoryFactory.createModel();

    return Object.assign(model, overrides, { isFavorited: true, rating: 0 });
  }
}

export class ProductDTOFactory {
  static createProductDTOLikeInstance(
    overrides?: Partial<CreateProductDTO>,
    undefinedField?: keyof CreateProductDTO,
  ): CreateProductDTO {
    const dto = new CreateProductDTO();

    if (undefinedField !== 'title')
      dto.title = overrides?.title ?? TitleConstants.EXEMPLE;

    if (undefinedField !== 'price')
      dto.price = overrides?.price ?? PriceConstants.EXEMPLE;

    if (undefinedField !== 'description')
      dto.description = overrides?.description ?? DescriptionConstants.EXEMPLE;

    if (undefinedField !== 'overview')
      dto.overview = overrides?.overview ?? OverviewConstants.EXEMPLE;

    if (undefinedField !== 'photos')
      dto.photos = overrides?.photos ?? PhotosConstants.EXEMPLE;

    if (undefinedField !== 'payments')
      dto.payments = overrides?.payments ?? PaymentsConstants.EXEMPLE;

    if (undefinedField !== 'active') dto.active = overrides?.active ?? true;

    if (undefinedField !== 'stock')
      dto.stock = overrides?.stock ?? StockConstants.EXEMPLE;

    if (undefinedField !== 'categoryID')
      dto.categoryID = overrides?.categoryID ?? CategoryConstants.EXEMPLE;

    return dto;
  }

  static createUpdateProductDTO(
    overrides?: Partial<UpdateProductDTO>,
  ): UpdateProductDTO {
    const dto = new UpdateProductDTO();

    if (overrides?.title !== undefined) dto.title = overrides.title;
    if (overrides?.price !== undefined) dto.price = overrides.price;
    if (overrides?.description !== undefined)
      dto.description = overrides.description;
    if (overrides?.overview !== undefined) dto.overview = overrides.overview;
    if (overrides?.photos !== undefined) dto.photos = overrides.photos;
    if (overrides?.payments !== undefined) dto.payments = overrides.payments;
    if (overrides?.active !== undefined) dto.active = overrides.active;
    if (overrides?.stock !== undefined) dto.stock = overrides.stock;
    if (overrides?.categoryID !== undefined)
      dto.categoryID = overrides.categoryID;

    return dto;
  }
}
