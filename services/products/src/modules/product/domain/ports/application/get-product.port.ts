import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';
import { ApplicationResultReasons } from '../../enums/application-result-reasons';

export interface GetProductPort {
  getByID: (productID: string) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_POSSIBLE
  | ApplicationResultReasons.NOT_FOUND;

export type ExecuteReturn =
  | {
      ok: true;
      result: Omit<ProductModel, 'id'>;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
