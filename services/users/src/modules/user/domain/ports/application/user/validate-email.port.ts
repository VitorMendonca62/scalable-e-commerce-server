import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

export interface ValidateEmailPort {
  sendEmail: (email: string) => Promise<SendEmailResult>;
  validateCode: (code: string, email: string) => Promise<ValidateCodeResult>;
}

export type SendEmailResult = { ok: true };

type ValidateCodeResultReasons = ApplicationResultReasons.BUSINESS_RULE_FAILURE;

export type ValidateCodeResult =
  | { ok: true; result: string }
  | {
      ok: false;
      message: string;
      reason: ValidateCodeResultReasons;
    };
