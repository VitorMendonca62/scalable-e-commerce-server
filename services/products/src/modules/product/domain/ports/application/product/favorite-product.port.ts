import { ApplicationResultReasons } from '../../../enums/application-result-reasons';

export interface FavoriteProductPort {
  favorite: (productID: string, userID: string) => Promise<ExecuteReturn>;
  unfavorite: (productID: string, userID: string) => Promise<ExecuteReturn>;
}

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
