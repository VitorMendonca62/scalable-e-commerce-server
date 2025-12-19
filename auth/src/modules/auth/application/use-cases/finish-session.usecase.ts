import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FinishSessionUseCase {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async execute(tokenID: string, userID: string) {
    await this.tokenRepository.revokeOneSession(tokenID, userID);
  }
}
