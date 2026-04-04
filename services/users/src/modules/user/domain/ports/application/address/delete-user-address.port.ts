import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

export interface DeleteUserAddressPort {
  execute: (addressId: number, userID: string) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_FOUND
  | ApplicationResultReasons.NOT_POSSIBLE;

export type ExecuteReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };
