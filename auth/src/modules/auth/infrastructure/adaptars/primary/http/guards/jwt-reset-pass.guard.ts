import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JWTResetPassGuard extends AuthGuard('jwt-reset-pass') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, _info: any, _context: ExecutionContext) {
    if (err || user == undefined || user == null || user == false) {
      throw (
        err ||
        new WrongCredentials(
          'Token de recuperação de senha inválido ou expirado. Realize o processo novamente.',
        )
      );
    }

    return user;
  }
}
