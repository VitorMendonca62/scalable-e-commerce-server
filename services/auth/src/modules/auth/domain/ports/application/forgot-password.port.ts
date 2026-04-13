import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

export interface ForgotPasswordPort {
  sendCode: (email: string) => Promise<SendCodeReturn>;

  validateCode: (code: string, email: string) => Promise<ValidateCodeReturn>;
}

export type ValidateCodeReturn =
  | {
      ok: true;
      result: string;
    }
  | {
      ok: false;
      reason: ApplicationResultReasons.FIELD_INVALID;

      message: string;
      result: string;
    }
  | {
      ok: false;
      reason: ApplicationResultReasons.NOT_POSSIBLE;
      message: string;
    };

export type SendCodeReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: ApplicationResultReasons.NOT_POSSIBLE;
      message: string;
    };
