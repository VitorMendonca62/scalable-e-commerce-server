import { PaymentTypes } from '@product/domain/enums/payments-types.enum';
import {
  Active,
  Description,
  Overview,
  Payments,
  Photos,
  Price,
  Stock,
  Title,
} from '../decorators/dtos/product';
import { Category } from '../decorators/dtos/product/category.decorator';

export default class CreateProductDTO {
  @Title()
  title: string;

  @Price()
  price: number;

  @Description()
  description: string;

  @Overview()
  overview: string;

  @Photos()
  photos: string[];

  @Payments()
  payments: PaymentTypes[];

  @Active()
  active: boolean;

  @Stock()
  stock: number;

  @Category()
  categoryID: string;
}
