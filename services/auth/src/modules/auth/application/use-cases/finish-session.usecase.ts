import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { Injectable } from '@nestjs/common';
import {
  FinishSessionPort,
  ExecuteReturn,
} from '@auth/domain/ports/application/finish-session.port';

@Injectable()
export class FinishSessionUseCase implements FinishSessionPort {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async execute(tokenID: string, userID: string): Promise<ExecuteReturn> {
    await this.tokenRepository.revokeOneSession(tokenID, userID);

    return {
      ok: true,
    };
  }
}
