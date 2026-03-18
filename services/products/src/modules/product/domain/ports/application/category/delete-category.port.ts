import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_POSSIBLE
  | ApplicationResultReasons.NOT_FOUND;

export type ExecuteReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };

export interface DeleteCategoryPort {
  execute: (id: string) => Promise<ExecuteReturn>;
}
