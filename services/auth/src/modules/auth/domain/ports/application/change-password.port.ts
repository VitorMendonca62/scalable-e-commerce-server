import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

export interface ChangePasswordPort {
  executeUpdate: (
    userID: string,
    newPassword: string,
    oldPassword: string,
  ) => Promise<ExecuteUpdateReturn>;
}

export type ExecuteUpdateReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: ApplicationResultReasons.NOT_FOUND;
    }
  | {
      ok: false;
      reason: ApplicationResultReasons.FIELD_INVALID;
      message: string;
      result: string;
    };

export type ExecuteResetReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: ApplicationResultReasons.NOT_FOUND;
      message: string;
    };
