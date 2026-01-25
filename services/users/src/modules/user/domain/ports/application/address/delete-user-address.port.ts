import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

export interface DeleteUserAddressPort {
  execute: (addressIndex: number, userID: string) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons = ApplicationResultReasons.NOT_FOUND;

export type ExecuteReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
