// Decorator's
import { Injectable } from '@nestjs/common';

// Ports
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';

// Services
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';

// Mappers
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';

// Entities
import { UserLogin } from '../../domain/entities/user-login.entity';

// Repositories
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
@Injectable()
export class CreateSessionUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(inputUser: UserLogin) {
    const userJSON = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    if (userJSON == undefined || userJSON == null) {
      throw new WrongCredentials();
    }

    const user = this.userMapper.jsonToUser(userJSON);
    if (
      !(user.password as PasswordHashedVO).comparePassword(
        inputUser.password.getValue(),
      )
    ) {
      throw new WrongCredentials();
    }

    const accessToken = this.tokenService.generateAccessToken({
      email: user.email.getValue(),
      userID: user.userID.getValue(),
      roles: user.roles,
    });
    const refreshToken = this.tokenService.generateRefreshToken(
      user.userID.getValue(),
    );

    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
      type: 'Bearer',
    };
  }
}
