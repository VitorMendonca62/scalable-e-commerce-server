import {
  GetAccessTokenPort,
  TokenService,
} from '../ports/primary/session.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';
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
