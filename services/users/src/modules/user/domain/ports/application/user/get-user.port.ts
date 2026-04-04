import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

export interface GetUserPort {
  execute: (
    identifier: string,
    field: 'username' | 'userID',
  ) => Promise<ExecuteReturn>;
}
type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_FOUND
  | ApplicationResultReasons.NOT_POSSIBLE;

export type ExecuteReturn =
  | {
      ok: true;
      result: {
        name: string;
        username: string;
        email: string;
        avatar: string;
        phoneNumber: string;
      };
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
