import { UserEntity } from '@user/domain/entities/user.entity';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';
import { PermissionsSystem } from '@user/domain/types/permissions';

export interface CreateUserPort {
  execute: (user: UserEntity, password: string) => Promise<ExecuteReturn>;
}

export type ExecuteReturn =
  | {
      ok: true;
      result: {
        roles: PermissionsSystem[];
        createdAt: Date;
        updatedAt: Date;
        password: string;
      };
    }
  | {
      ok: false;
      message: string;
      result: 'email' | 'username';
      reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS;
    }
  | {
      ok: false;
      message: string;
      reason: ApplicationResultReasons.NOT_POSSIBLE;
    };
