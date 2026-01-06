import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { UserInResetPassToken } from '@auth/domain/types/user';
import { AuthGuard } from '@nestjs/passport';

export class JWTResetPassGuard extends AuthGuard('jwt-reset-pass') {
  handleRequest<TUser = UserInResetPassToken>(
    err: Error | null,
    user: UserInResetPassToken | false | undefined,
  ) {
    if (err || !user) {
      throw (
        err ||
        new WrongCredentials(
          'Token de recuperação de senha inválido ou expirado. Realize o processo novamente.',
        )
      );
    }

    return user as TUser;
  }
}
