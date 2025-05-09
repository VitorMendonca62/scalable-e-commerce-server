import { BadRequestException, Injectable } from '@nestjs/common';
import { UserLogin } from '../../domain/entities/user-login.entity';
import {
  CreateSessionOutbondPort,
  CreateSessionPort,
  TokenService,
} from '../ports/primary/session.port';
import { UserRepository } from '../ports/secondary/user-repository.interface';

@Injectable()
export class CreateSessionUseCase implements CreateSessionPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly TokenService: TokenService,
  ) {}

  async execute(inputUser: UserLogin): Promise<CreateSessionOutbondPort> {
    const user = await this.userRepository.findByEmail(inputUser.email);

    if (!user) {
      throw new BadRequestException('Email ou senha estão incorretos.');
    }

    if (!user.password.comparePassword(inputUser.password.getValue())) {
      throw new BadRequestException('Email ou senha estão incorretos.');
    }

    const accessToken = this.TokenService.generateAccessToken(user);

    const refreshToken = this.TokenService.generateRefreshToken(user._id);

    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
      type: 'Bearer',
    };
  }
}
