import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

export interface ForgotPasswordPort {
  sendCode: (email: string) => Promise<SendCodeReturn>;

  validateCode: (code: string, email: string) => Promise<ValidateCodeReturn>;
}

type ValidateCodeResultReasons = ApplicationResultReasons.FIELD_INVALID;

export type ValidateCodeReturn =
  | {
      ok: true;
      result: string;
    }
  | {
      ok: false;
      reason: ValidateCodeResultReasons;
      message: string;
    };

export type SendCodeReturn = {
  ok: true;
};
