import { ApplicationResultReasons } from '../../../enums/application-result-reasons';
import { GetOneReturn } from '../../secondary/product-repository.port';

export interface GetProductPort {
  getByID: (productID: string, userID: string) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_POSSIBLE
  | ApplicationResultReasons.NOT_FOUND;

export type ExecuteReturn =
  | {
      ok: true;
      result: GetOneReturn;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
