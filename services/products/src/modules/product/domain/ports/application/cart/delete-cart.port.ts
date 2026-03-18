import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';

export interface DeleteCartPort {
  execute: (cartID: string, userID: string) => Promise<ExecuteReturn>;
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
