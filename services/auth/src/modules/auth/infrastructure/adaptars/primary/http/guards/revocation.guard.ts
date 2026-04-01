import { InvalidToken } from '@auth/domain/ports/primary/http/errors.port';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { isEmpty } from 'class-validator';

@Injectable()
export default class RevocationGuard implements CanActivate {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const tokenID: string | null | undefined = request.headers['x-token-id'];
    const userID: string | null | undefined = request.headers['x-user-id'];

    if (isEmpty(tokenID) || isEmpty(userID)) {
      throw new InvalidToken('Sessão inválida. Faça login novamente.');
    }

    const isRevoked = await this.tokenRepository.isRevoked(tokenID, userID);

    if (isRevoked) {
      throw new InvalidToken('Sessão inválida. Faça login novamente.');
    }

    return true;
  }
}
