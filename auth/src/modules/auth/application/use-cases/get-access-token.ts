import {
  GetAccessTokenPort,
  TokenService,
} from '@modules/auth/domain/ports/primary/session.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { WrongCredentials } from '@modules/auth/domain/types/errors/errors';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetAccessTokenUseCase implements GetAccessTokenPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(refreshToken: string): Promise<string> {
    const { sub: id } = this.tokenService.verifyToken(refreshToken);

    const user = await this.userRepository.findOne({ id });

    if (!user) {
      throw new WrongCredentials('Token está inválido');
    }

    return this.tokenService.generateAccessToken(user);
  }
}
