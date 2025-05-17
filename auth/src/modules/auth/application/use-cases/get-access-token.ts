import {
  GetAccessTokenPort,
  TokenService,
} from '@modules/auth/domain/ports/primary/session.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class GetAccessTokenUseCase implements GetAccessTokenPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(refreshToken: string): Promise<string> {
    const { sub: id } = this.tokenService.verifyToken(refreshToken);

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new BadRequestException('Esse token está inválido');
    }

    return this.tokenService.generateAccessToken(user);
  }
}
