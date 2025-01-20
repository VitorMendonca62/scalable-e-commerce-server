import { Injectable, NotFoundException } from '@nestjs/common';
import { UserLogin } from '../../domain/entities/user-login.entity';
import {
  CreateSessionOutbondPort,
  CreateSessionPort,
} from '../ports/primary/session.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';
import { JwtTokenService } from '../services/jwt-token.service';

@Injectable()
export class CreateSessionUseCase implements CreateSessionPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(inputUser: UserLogin): Promise<CreateSessionOutbondPort> {
    const user = await this.userRepository.findByEmail(inputUser.email);

    if (!user) {
      throw new NotFoundException('Email ou senha estão incorretos.');
    }

    if (!user.validatePassword(inputUser.password)) {
      throw new NotFoundException('Email ou senha estão incorretos.');
    }

    const accessTokenPlayload = {
      sub: user._id,
      email: user.email,
      roles: user.roles,
      type: 'access' as const,
    };

    const refreshTokenPlayload = {
      sub: user._id,
      type: 'refresh' as const,
    };

    const accessToken =
      this.jwtTokenService.generateAccessToken(accessTokenPlayload);

    const refreshToken =
      this.jwtTokenService.generateRefreshToken(refreshTokenPlayload);

    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
      type: 'Bearer',
    };
  }
}
