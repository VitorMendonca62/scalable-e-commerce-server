import CategoryEntity from '@product/domain/entities/category.entity';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_POSSIBLE
  | ApplicationResultReasons.ALREADY_EXISTS;

export type ExecuteReturn =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
      reason: ExecuteResultReasons;
    };

export interface CreateCategoryPort {
  execute: (category: CategoryEntity) => Promise<ExecuteReturn>;
}
