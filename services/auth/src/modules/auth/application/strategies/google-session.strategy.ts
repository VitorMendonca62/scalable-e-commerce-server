import { Injectable } from '@nestjs/common';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import {
  ProviderSessionResult,
  ProviderSessionStrategy,
} from './provider-session.strategy';
import { SessionUser } from '@auth/domain/types/session-user';
import { v7 } from 'uuid';

@Injectable()
export class GoogleSessionStrategy implements ProviderSessionStrategy {
  readonly provider = AccountsProvider.GOOGLE;

  constructor(private readonly userRepository: UserRepository) {}

  async execute(inputUser: UserGoogleLogin): Promise<ProviderSessionResult> {
    const sessionUser = await this.userRepository.findSessionUserByEmail(
      inputUser.email.getValue(),
    );

    let baseUser: SessionUser;
    let newUser: SessionUser | undefined;

    if (sessionUser === null) {
      baseUser = await this.userRepository.createGoogleUser(inputUser, v7());
      newUser = baseUser;
    } else {
      baseUser = sessionUser;
    }
    if (
      sessionUser !== null &&
      baseUser.accountProvider === AccountsProvider.DEFAULT
    ) {
      await this.userRepository.updateAccountProvider(
        baseUser.userID,
        AccountsProvider.GOOGLE,
        inputUser.id,
      );
    }

    return { baseUser, newUser };
  }
}
