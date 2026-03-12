import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';
import { ApplicationResultReasons } from '../../enums/application-result-reasons';

export interface UpdateProductPort {
  execute: (
    productID: string,
    userID: string,
    updates: Partial<ProductModel>,
  ) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_POSSIBLE
  | ApplicationResultReasons.NOT_FOUND;

export type ExecuteReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
