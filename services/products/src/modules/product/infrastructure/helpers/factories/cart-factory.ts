import CartEntity from '@product/domain/entities/cart.entity';
import { CartItem } from '@product/domain/types/cart';
import { IDConstants } from '@product/domain/values-objects/constants';
import CreateCartDTO, {
  CartItemDTO,
} from '@product/infrastructure/adaptars/primary/http/dtos/create-cart.dto';
// import CreateCartDTO, {
//   CartItemDTO,
// } from '@product/infrastructure/adaptars/primary/http/dtos/create-cart.dto';
import UpdateCartDTO from '@product/infrastructure/adaptars/primary/http/dtos/update-cart.dto';
import CartModel from '@product/infrastructure/adaptars/secondary/database/models/cart.model';

export class CartFactory {
  static createItem(overrides?: Partial<CartItem>): CartItem {
    return {
      productID: IDConstants.EXEMPLE,
      quantity: 1,
      ...overrides,
    };
  }

  static createEntity(overrides?: Partial<CartEntity>): CartEntity {
    return new CartEntity({
      publicID: IDConstants.EXEMPLE,
      userID: IDConstants.EXEMPLE,
      items: [CartFactory.createItem()],
      ...overrides,
    });
  }

  static createModel(overrides?: Partial<CartModel>): CartModel {
    const model = new CartModel();
    model.id = IDConstants.EXEMPLE;
    model.publicID = IDConstants.EXEMPLE;
    model.userID = IDConstants.EXEMPLE;
    model.items = [CartFactory.createItem()];
    model.createdAt = new Date();
    model.updatedAt = new Date();

    return Object.assign(model, overrides);
  }
}

export class CartDTOFactory {
  static createCartItemDTO(overrides?: Partial<CartItemDTO>): CartItemDTO {
    const dto = new CartItemDTO();
    dto.productID = overrides?.productID ?? IDConstants.EXEMPLE;
    dto.quantity = overrides?.quantity ?? 1;
    return dto;
  }

  static createCreateCartDTO(
    overrides?: Partial<CreateCartDTO>,
    undefinedField?: keyof CreateCartDTO,
  ): CreateCartDTO {
    const dto = new CreateCartDTO();

    if (undefinedField !== 'items')
      dto.items = overrides?.items ?? [CartDTOFactory.createCartItemDTO()];

    return dto;
  }

  static createUpdateCartDTO(
    overrides?: Partial<UpdateCartDTO>,
  ): UpdateCartDTO {
    const dto = new UpdateCartDTO();

    if (overrides?.items !== undefined) dto.items = overrides.items;

    return dto;
  }
}
