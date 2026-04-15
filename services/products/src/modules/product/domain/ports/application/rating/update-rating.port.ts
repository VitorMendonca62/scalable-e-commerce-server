import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import ProductRatingModel from '@product/infrastructure/adaptars/secondary/database/models/rating.model';

export interface UpdateRatingPort {
  execute: (
    productID: string,
    userID: string,
    updates: Partial<ProductRatingModel>,
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
