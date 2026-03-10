import ProductEntity from '../../entities/product.entity';
import { ApplicationResultReasons } from '../../enums/application-result-reasons';

export interface CreateProductPort {
  execute: (product: ProductEntity) => Promise<ExecuteReturn>;
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
