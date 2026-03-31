import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { Injectable } from '@nestjs/common';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { UserLogin } from '../../domain/entities/user-login.entity';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import {
  CreateSesssionPort,
  ExecuteReturn,
  ExecuteWithGoogleReturn,
} from '@auth/domain/ports/application/create-session.port';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { SessionUser } from '@auth/domain/types/session-user';
import { ProviderSessionRegistry } from '../strategies/provider-session.registry';

@Injectable()
export class CreateSessionUseCase implements CreateSesssionPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly tokenService: TokenService,
    private readonly passwordHasher: PasswordHasher,
    private readonly providerSessionRegistry: ProviderSessionRegistry,
  ) {}

  async execute(inputUser: UserLogin): Promise<ExecuteReturn> {
    const sessionUser = await this.userRepository.findSessionUserByEmail(
      inputUser.email.getValue(),
    );

    const passwordToCompare = sessionUser?.password ?? this.getDummyHash();

    const isPasswordValid = await this.passwordHasher.compare(
      inputUser.password.getValue(),
      passwordToCompare,
    );

    if (
      sessionUser === null ||
      sessionUser.password == null ||
      !isPasswordValid
    ) {
      return {
        ok: false,
        reason: ApplicationResultReasons.WRONG_CREDENTIALS,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      };
    }

    return {
      ok: true,
      result: await this.generateAccessAndRefreshToken(
        sessionUser,
        inputUser.ip,
        inputUser.userAgent,
      ),
    };
  }

  async executeWithGoogle(
    inputUser: UserGoogleLogin,
  ): Promise<ExecuteWithGoogleReturn> {
    const strategy = this.providerSessionRegistry.get(AccountsProvider.GOOGLE);
    const { baseUser, newUser } = await strategy.execute(inputUser);

    return {
      ok: true,
      result: {
        tokens: await this.generateAccessAndRefreshToken(
          baseUser,
          inputUser.ip,
          inputUser.userAgent,
        ),
        newUser: newUser,
      },
    };
  }

  private async generateAccessAndRefreshToken(
    user: SessionUser,
    ip: string,
    userAgent: string,
  ) {
    const accessToken = this.tokenService.generateAccessToken({
      email: user.email,
      userID: user.userID,
      roles: user.roles,
    });

    const { refreshToken, tokenID } = this.tokenService.generateRefreshToken(
      user.userID,
    );

    await this.tokenRepository.saveSession(tokenID, user.userID, ip, userAgent);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  private getDummyHash(): string {
    return '$2b$10$vorH1nYFz83im3JmINcCzOCEfopiqn0WF5mN6VtMNjrLz5riU/WKi';
  }
}
