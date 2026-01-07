import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { Injectable } from '@nestjs/common';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';

@Injectable()
export class GetAccessTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async execute(userID: string, tokenID: string): Promise<string> {
    const user = await this.userRepository.findOne({ userID });

    if (user === undefined || user === null) {
      throw new WrongCredentials('Token inválido ou expirado');
    }

    this.tokenRepository.updateLastAcess(tokenID);

    return this.tokenService.generateAccessToken(user);
  }
}
