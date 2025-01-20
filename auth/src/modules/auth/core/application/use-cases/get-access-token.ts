import { GetAccessTokenPort } from '../ports/primary/session.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';
import { JwtTokenService } from '../services/jwt-token.service';
import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class GetAccessTokenUseCase implements GetAccessTokenPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(refreshToken: string): Promise<string> {
    const { sub: id } = this.jwtTokenService.verifyToken(refreshToken);

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new BadRequestException('Esse token está inválido');
    }

    return this.jwtTokenService.generateAccessToken(user);
  }
}
