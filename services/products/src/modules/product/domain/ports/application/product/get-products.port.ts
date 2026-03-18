import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';
import { ApplicationResultReasons } from '../../../enums/application-result-reasons';
import { PaymentTypes } from '@product/domain/enums/payments-types.enum';

export interface GetProductsPort {
  getByFilter: (filters: ProductFilters) => Promise<ExecuteReturn>;
}

export interface ProductFilters {
  categoryID?: string[];
  price?: { min: number | undefined; max: number | undefined };
  stock?: { min: number | undefined; max: number | undefined };
  payments?: PaymentTypes[];
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_POSSIBLE
  | ApplicationResultReasons.NOT_FOUND;

export type ExecuteReturn =
  | {
      ok: true;
      result: Omit<ProductModel[], 'id'>;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
