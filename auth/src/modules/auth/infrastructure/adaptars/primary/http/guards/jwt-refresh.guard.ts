import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { UserInRefreshToken } from '@auth/domain/types/user';
import { AuthGuard } from '@nestjs/passport';

export class JWTRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = UserInRefreshToken>(
    err: Error | null,
    user: UserInRefreshToken | false | undefined,
  ): TUser {
    if (err != null || !user) {
      throw err || new WrongCredentials('Token inválido ou expirado');
    }

    return user as TUser;
  }
}
