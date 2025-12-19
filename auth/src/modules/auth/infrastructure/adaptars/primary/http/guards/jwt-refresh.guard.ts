import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JWTRefreshGuard extends AuthGuard('jwt-refresh') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, _info: any, _context: ExecutionContext) {
    if (err != null || user == undefined || user == null || user == false) {
      throw err || new WrongCredentials('Token inválido ou expirado');
    }

    return user;
  }
}
