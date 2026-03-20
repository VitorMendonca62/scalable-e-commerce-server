import CategoryEntity from '@product/domain/entities/category.entity';
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

export interface UpdateCategoryPort {
  execute: (updates: Partial<CategoryEntity>) => Promise<ExecuteReturn>;
}
