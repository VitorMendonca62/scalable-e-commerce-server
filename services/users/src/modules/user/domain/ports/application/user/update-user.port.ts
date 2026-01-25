import { UserUpdateEntity } from '@modules/user/domain/entities/user-update.entity';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

export interface UpdateUserPort {
  execute: (
    userID: string,
    userUpdate: UserUpdateEntity,
  ) => Promise<ExecuteResult>;
}

type ExecuteResultReasons = ApplicationResultReasons.NOT_FOUND;

export type ExecuteResult =
  | { ok: true }
  | { ok: false; message: string; reason: ExecuteResultReasons }
  | {
      ok: false;
      message: string;
      result: 'username';
      reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS;
    };
