import { UserEntity } from '@modules/user/domain/entities/user.entity';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';
import { PermissionsSystem } from '@modules/user/domain/types/permissions';

export interface CreateUserPort {
  execute: (user: UserEntity) => Promise<ExecuteReturn>;
}

type ExecuteResultReasons = ApplicationResultReasons.FIELD_ALREADY_EXISTS;

export type ExecuteReturn =
  | {
      ok: true;
      result: { roles: PermissionsSystem[]; createdAt: Date; updatedAt: Date };
    }
  | {
      ok: false;
      message: string;
      result: 'email' | 'username';
      reason: ExecuteResultReasons;
    };
