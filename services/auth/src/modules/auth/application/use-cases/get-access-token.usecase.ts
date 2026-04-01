import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import {
  GetAccessTokenPort,
  ExecuteReturn,
} from '@auth/domain/ports/application/get-access-token.port';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

@Injectable()
export class GetAccessTokenUseCase implements GetAccessTokenPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async execute(userID: string, tokenID: string): Promise<ExecuteReturn> {
    try {
      const user = await this.userRepository.findOne({ userID });

      if (user === undefined || user === null) {
        return {
          ok: false,
          reason: ApplicationResultReasons.NOT_FOUND,
          message: 'Sessão inválida. Faça login novamente.',
        };
      }

      await this.tokenRepository.updateLastAcess(tokenID);

      return {
        ok: true,
        result: this.tokenService.generateAccessToken(user),
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
