import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';

export interface CreateRatingPort {
  execute: (
    productID: string,
    userID: string,
    value: number,
  ) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_POSSIBLE
  | ApplicationResultReasons.ALREADY_EXISTS;

export type ExecuteReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
