import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import {
  ChangePasswordPort,
  ExecuteResetReturn,
  ExecuteUpdateReturn,
} from '@auth/domain/ports/application/change-password.port';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChangePasswordUseCase implements ChangePasswordPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async executeUpdate(
    userID: string,
    newPassword: string,
    oldPassword: string,
  ): Promise<ExecuteUpdateReturn> {
    const user = await this.userRepository.findOne({
      userID,
    });

    if (user === undefined || user === null) {
      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
      };
    }

    const oldPasswordVO = new PasswordHashedVO(
      user.password,
      this.passwordHasher,
    );
    if (!oldPasswordVO.comparePassword(oldPassword)) {
      return {
        ok: false,
        reason: ApplicationResultReasons.FIELD_INVALID,
        messsage: 'A senha atual informada está incorreta.',
        result: 'oldPassword',
      };
    }

    await this.updatePassword(user.userID, newPassword);
    return { ok: true };
  }

  async executeReset(
    email: string,
    newPassword: string,
  ): Promise<ExecuteResetReturn> {
    const user = await this.userRepository.findOne({
      email,
    });

    if (user === undefined || user === null) {
      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Token inválido ou expirado',
      };
    }

    await this.updatePassword(user.userID, newPassword);
    return { ok: true };
  }

  private async updatePassword(userID: string, newPassword: string) {
    const newPasswordVO = new PasswordVO(
      newPassword,
      true,
      this.passwordHasher,
    );

    await this.userRepository.update(userID, {
      password: newPasswordVO.getValue(),
    });

    await this.tokenRepository.revokeAllSessions(userID);
  }
}
