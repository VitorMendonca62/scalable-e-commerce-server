import { Injectable } from '@nestjs/common';
import { UserLogin } from '../../domain/entities/user-login.entity';
import {
  CreateSessionPort,
  CreateSessionOutbondPort,
  TokenService,
} from '@modules/auth/domain/ports/primary/session.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { WrongCredentials } from '@modules/auth/domain/types/errors/errors';

@Injectable()
export class CreateSessionUseCase implements CreateSessionPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(inputUser: UserLogin): Promise<CreateSessionOutbondPort> {
    const user = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    if (!user) {
      throw new WrongCredentials();
    }

    if (!user.password.comparePassword(inputUser.password.getValue())) {
      throw new WrongCredentials();
    }

    const accessToken = this.tokenService.generateAccessToken(user);

    const refreshToken = this.tokenService.generateRefreshToken(user._id);

    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
      type: 'Bearer',
    };
  }
}
