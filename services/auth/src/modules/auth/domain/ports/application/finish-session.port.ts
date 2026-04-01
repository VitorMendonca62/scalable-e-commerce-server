import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

export interface FinishSessionPort {
  execute: (tokenID: string, userID: string) => Promise<ExecuteReturn>;
}

export type ExecuteReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: ApplicationResultReasons.NOT_POSSIBLE;
      message: string;
    };
