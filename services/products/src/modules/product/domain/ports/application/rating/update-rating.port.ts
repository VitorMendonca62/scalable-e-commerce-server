import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';

export interface UpdateRatingPort {
  execute: (
    productID: string,
    userID: string,
    value: number,
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
