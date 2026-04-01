import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { Injectable } from '@nestjs/common';
import {
  FinishSessionPort,
  ExecuteReturn,
} from '@auth/domain/ports/application/finish-session.port';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

@Injectable()
export class FinishSessionUseCase implements FinishSessionPort {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async execute(tokenID: string, userID: string): Promise<ExecuteReturn> {
    try {
      await this.tokenRepository.revokeOneSession(tokenID, userID);

      return {
        ok: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      };
    }
  }
}
