import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JWTAuthGuard extends AuthGuard('jwt-auth') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, _info: any, _context: ExecutionContext) {
    if (err || user == undefined || user == null) {
      throw err || new WrongCredentials('Token inválido ou expirado');
    }

    return user;
  }
}
