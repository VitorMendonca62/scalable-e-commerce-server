import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { Injectable } from '@nestjs/common';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';
import { UserLogin } from '../../domain/entities/user-login.entity';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { UserModel } from '@auth/infrastructure/adaptars/secondary/database/models/user.model';
import { v7 } from 'uuid';
import {
  CreateSesssionPort,
  ExecuteReturn,
  ExecuteWithGoogleReturn,
} from '@auth/domain/ports/application/create-session.port';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

@Injectable()
export class CreateSessionUseCase implements CreateSesssionPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly tokenService: TokenService,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(inputUser: UserLogin): Promise<ExecuteReturn> {
    const userJSON = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    if (userJSON === undefined || userJSON === null) {
      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      };
    }

    const user = this.userMapper.modelToEntity(userJSON);
    if (
      !(user.password as PasswordHashedVO).comparePassword(
        inputUser.password.getValue(),
      )
    ) {
      return {
        ok: false,
        reason: ApplicationResultReasons.WRONG_CREDENTIALS,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      };
    }

    return {
      ok: true,
      result: await this.generateAccessAndRefreshToken(userJSON, inputUser.ip),
    };
  }

  async executeWithGoogle(
    inputUser: UserGoogleLogin,
  ): Promise<ExecuteWithGoogleReturn> {
    const userModel = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    let newUserModel: UserModel;
    if (userModel === null || userModel === undefined) {
      const newUser = this.userMapper.googleEntityForModel(inputUser, v7());

      newUserModel = await this.userRepository.create(newUser);
    }

    if (
      newUserModel === undefined &&
      userModel.accountProvider === AccountsProvider.DEFAULT
    ) {
      await this.userRepository.update(userModel.userID, {
        accountProvider: AccountsProvider.GOOGLE,
        accountProviderID: inputUser.id,
      });
    }

    return {
      ok: true,
      result: {
        tokens: await this.generateAccessAndRefreshToken(
          newUserModel || userModel,
          inputUser.ip,
        ),
        newUser: newUserModel,
      },
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
