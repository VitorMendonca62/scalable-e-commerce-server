import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ResetPassTokenGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];

    if (authorizationHeader === undefined || authorizationHeader === null) {
      throw new WrongCredentials('Token inválido ou expirado');
    }
    if (!authorizationHeader.startsWith('Bearer')) {
      throw new WrongCredentials('Token inválido ou expirado');
    }

    const token = authorizationHeader.replace('Bearer ', '');
    this.tokenService.verifyResetPassToken(token);
    return true;
  }
}
