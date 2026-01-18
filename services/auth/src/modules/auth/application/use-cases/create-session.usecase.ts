import { AccountsProvider } from '@auth/domain/types/accounts-provider';
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
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { UserModel } from '@auth/infrastructure/adaptars/secondary/database/models/user.model';
import { v7 } from 'uuid';

@Injectable()
export class CreateSessionUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly tokenService: TokenService,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(inputUser: UserLogin) {
    const userJSON = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    if (userJSON === undefined || userJSON === null) {
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

    if (user.active == false) throw new WrongCredentials();

    return await this.generateAccessAndRefreshToken(userJSON, inputUser.ip);
  }

  async executeWithGoogle(inputUser: UserGoogleLogin) {
    const userModel = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    let newUserModel: UserModel;
    if (userModel === null || userModel === undefined) {
      const newUser = this.userMapper.googleUserCreateForJSON(inputUser, v7());

      newUserModel = await this.userRepository.create(newUser);
    }

    if (newUserModel == undefined) {
      if (userModel.active === false) {
        throw new WrongCredentials();
      }

      if (userModel.accountProvider == AccountsProvider.DEFAULT) {
        await this.userRepository.update(userModel.userID, {
          accountProvider: AccountsProvider.GOOGLE,
          accountProviderID: inputUser.id,
        });
      }
    }

    return {
      result: await this.generateAccessAndRefreshToken(
        newUserModel || userModel,
        inputUser.ip,
      ),
      newUser: newUserModel,
    };
  }

  private async generateAccessAndRefreshToken(user: UserModel, ip: string) {
    const accessToken = this.tokenService.generateAccessToken({
      email: user.email,
      userID: user.userID,
      roles: user.roles,
    });

    const { refreshToken, tokenID } = this.tokenService.generateRefreshToken(
      user.userID,
    );

    await this.tokenRepository.saveSession(tokenID, user.userID, ip);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
