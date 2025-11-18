import { Injectable } from '@nestjs/common';
import { UserLogin } from '../../domain/entities/user-login.entity';
import {
  CreateSessionPort,
  CreateSessionOutbondPort,
  TokenService,
} from '@modules/auth/domain/ports/primary/session.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { WrongCredentials } from '@modules/auth/domain/ports/primary/http/errors.port';
import { UserMapper } from '@modules/auth/infrastructure/mappers/user.mapper';

@Injectable()
export class CreateSessionUseCase implements CreateSessionPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(inputUser: UserLogin): Promise<CreateSessionOutbondPort> {
    const userJSON = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    if (!userJSON) {
      throw new WrongCredentials();
    }

    const user = this.userMapper.jsonToUser(userJSON);
    if (!user.password.comparePassword(inputUser.password.getValue())) {
      throw new WrongCredentials();
    }

    const accessToken = this.tokenService.generateAccessToken(userJSON);

    const refreshToken = this.tokenService.generateRefreshToken(user.userID);

    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
      type: 'Bearer',
    };
  }
}
