import {
  GetAccessTokenPort,
  TokenService,
} from '@modules/auth/domain/ports/primary/session.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { WrongCredentials } from '@modules/auth/domain/ports/primary/http/errors.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetAccessTokenUseCase implements GetAccessTokenPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(refreshToken: string): Promise<string> {
    const { sub: id } = this.tokenService.verifyToken(refreshToken);

    const user = await this.userRepository.findOne({ _id: id });

    if (!user) {
      throw new WrongCredentials('Token inválido ou expirado');
    }

    return this.tokenService.generateAccessToken(user);
  }
}
