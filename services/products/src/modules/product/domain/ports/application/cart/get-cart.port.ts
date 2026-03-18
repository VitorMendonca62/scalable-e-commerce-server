import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import CartModel from '@product/infrastructure/adaptars/secondary/database/models/cart.model';

export interface GetCartPort {
  getByID: (cartID: string, userID: string) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_POSSIBLE
  | ApplicationResultReasons.NOT_FOUND;

export type ExecuteReturn =
  | {
      ok: true;
      result: Omit<CartModel, 'id' | 'userID'>;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
