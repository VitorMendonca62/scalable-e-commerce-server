import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import { PublicCategory } from '@product/domain/types/category';

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_POSSIBLE
  | ApplicationResultReasons.NOT_FOUND;

export type ExecuteReturn =
  | {
      ok: true;
      result: PublicCategory;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };

export interface GetCategoryPort {
  getBySlug: (slug: string) => Promise<ExecuteReturn>;
}
