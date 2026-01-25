import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

export interface GetUserPort {
  execute: (
    identifier: string,
    field: 'username' | 'userID',
  ) => Promise<ExecuteReturn>;
}
type ExecuteResultReasons = ApplicationResultReasons.NOT_FOUND;

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
