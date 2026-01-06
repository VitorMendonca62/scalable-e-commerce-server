import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { UserInAcessToken } from '@auth/domain/types/user';
import { AuthGuard } from '@nestjs/passport';

export class JWTAccessGuard extends AuthGuard('jwt-access') {
  handleRequest<TUser = UserInAcessToken>(
    err: Error | null,
    user: UserInAcessToken | false | undefined,
  ): TUser {
    if (err || !user) {
      throw err || new WrongCredentials('Token inválido ou expirado');
    }

    return user as TUser;
  }
}
