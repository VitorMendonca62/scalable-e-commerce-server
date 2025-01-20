import { BadRequestException, Injectable } from '@nestjs/common';
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
      throw new BadRequestException('Email ou senha estão incorretos.');
    }

    if (!user.validatePassword(inputUser.password)) {
      throw new BadRequestException('Email ou senha estão incorretos.');
    }

    const accessToken = this.jwtTokenService.generateAccessToken(user);

    const refreshToken = this.jwtTokenService.generateRefreshToken(user._id);

    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
      type: 'Bearer',
    };
  }
}
