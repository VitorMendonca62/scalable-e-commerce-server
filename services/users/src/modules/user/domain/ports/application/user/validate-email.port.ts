import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

export interface ValidateEmailPort {
  sendEmail: (email: string) => Promise<SendEmailResult>;
  validateCode: (code: string, email: string) => Promise<ValidateCodeResult>;
}

export type SendEmailResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      reason: ApplicationResultReasons.NOT_POSSIBLE;
    };

type ValidateCodeResultReasons =
  | ApplicationResultReasons.BUSINESS_RULE_FAILURE
  | ApplicationResultReasons.NOT_POSSIBLE;

export type ValidateCodeResult =
  | { ok: true; result: string }
  | {
      ok: false;
      message: string;
      reason: ValidateCodeResultReasons;
    };
