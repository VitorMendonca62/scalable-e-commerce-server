import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import CartModel from '@product/infrastructure/adaptars/secondary/database/models/cart.model';

export interface UpdateCartPort {
  execute: (
    cartID: string,
    userID: string,
    updates: Partial<CartModel>,
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
