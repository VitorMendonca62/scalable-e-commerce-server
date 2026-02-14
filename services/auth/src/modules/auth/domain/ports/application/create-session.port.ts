import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import { UserModel } from '@auth/infrastructure/adaptars/secondary/database/models/user.model';

export interface CreateSesssionPort {
  execute: (inputUser: UserLogin) => Promise<ExecuteReturn>;
  executeWithGoogle: (
    inputUser: UserGoogleLogin,
  ) => Promise<ExecuteWithGoogleReturn>;
}

type ExecuteResultReasons = ApplicationResultReasons.WRONG_CREDENTIALS;

export type ExecuteReturn =
  | {
      ok: true;
      result: {
        accessToken: string;
        refreshToken: string;
      };
    }
  | {
      ok: false;
      message?: string;
      reason: ExecuteResultReasons;
    };

export type ExecuteWithGoogleReturn = {
  ok: true;
  result: {
    tokens: { accessToken: string; refreshToken: string };
    newUser: UserModel | undefined;
  };
};
