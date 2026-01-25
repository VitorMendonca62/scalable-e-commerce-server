import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

export interface DeleteUserPort {
  execute: (userID: string) => Promise<ExecuteResult>;
}

type ExecuteResultReasons = ApplicationResultReasons.NOT_FOUND;

export type ExecuteResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
