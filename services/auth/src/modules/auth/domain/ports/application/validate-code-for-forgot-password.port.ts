import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

export interface ValidateCodeForForgotPasswordPort {
  execute: (code: string, email: string) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons = ApplicationResultReasons.FIELD_INVALID;

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
