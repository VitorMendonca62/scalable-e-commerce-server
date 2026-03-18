import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import CartEntity from '@product/domain/entities/cart.entity';

export interface CreateCartPort {
  execute: (cart: CartEntity) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons = ApplicationResultReasons.NOT_POSSIBLE;

export type ExecuteReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
