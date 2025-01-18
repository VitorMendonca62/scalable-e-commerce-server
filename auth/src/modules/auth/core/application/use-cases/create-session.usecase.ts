import { NotFoundException } from '@nestjs/common';
import { UserLogin } from '../../domain/entities/user-login.entity';
import {
  CreateSessionOutbondPort,
  CreateSessionPort,
} from '../ports/primary/session.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';
import { JwtTokenService } from '../services/jwt-token.service';

export class CreateSessionUseCase implements CreateSessionPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(inputUser: UserLogin): Promise<CreateSessionOutbondPort> {
    const user = await this.userRepository.findByEmail(inputUser.email);

    const passwordIsCorrect = user.validatePassword(inputUser.password);

    if (!user || passwordIsCorrect) {
      throw new NotFoundException('Email ou senha estão incorretos.');
    }

    const accessTokenPlayload = {
      sub: user._id,
      email: user.email,
      roles: user.roles,
      type: 'access',
    };

    const refreshTokenPlayload = {
      id: user._id,
      type: 'refresh',
    };

    const accessToken = this.jwtTokenService.generateToken(
      accessTokenPlayload,
      '1h',
    );
    const refreshToken = this.jwtTokenService.generateToken(
      refreshTokenPlayload,
      '7D',
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
