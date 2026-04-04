import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

export interface DeleteUserPort {
  execute: (userID: string) => Promise<ExecuteResult>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_FOUND
  | ApplicationResultReasons.NOT_POSSIBLE;

export type ExecuteResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
