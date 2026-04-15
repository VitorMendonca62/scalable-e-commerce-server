import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';

import RatingEntity from '@product/domain/entities/rating.entity';

export interface CreateRatingPort {
  execute: (rating: RatingEntity) => Promise<ExecuteReturn>;
}

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
