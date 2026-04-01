import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

export interface GetAccessTokenPort {
  execute: (userID: string, tokenID: string) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_FOUND
  | ApplicationResultReasons.NOT_POSSIBLE;

export type ExecuteReturn =
  | {
      ok: true;
      result: string;
    }
  | {
      ok: false;
      reason: ExecuteResultReasons;
      message: string;
    };
