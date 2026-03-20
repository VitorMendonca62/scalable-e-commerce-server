import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import { PublicCategory } from '@product/domain/types/category';

type ExecuteResultReasons = ApplicationResultReasons.NOT_POSSIBLE;

export type ExecuteReturn =
  | {
      ok: true;
      result: [PublicCategory[], string | null];
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };

export interface GetCategoriesPort {
  getAll: (cursor: string | null) => Promise<ExecuteReturn>;
}
