import { UserUpdateEntity } from '@user/domain/entities/user-update.entity';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

export interface UpdateUserPort {
  execute: (
    userID: string,
    userUpdate: UserUpdateEntity,
  ) => Promise<ExecuteResult>;
}

type ExecuteResultReasons =
  | ApplicationResultReasons.NOT_FOUND
  | ApplicationResultReasons.NOT_POSSIBLE;

export type ExecuteResult =
  | { ok: true }
  | { ok: false; message: string; reason: ExecuteResultReasons }
  | {
      ok: false;
      message: string;
      result: 'username';
      reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS;
    };
