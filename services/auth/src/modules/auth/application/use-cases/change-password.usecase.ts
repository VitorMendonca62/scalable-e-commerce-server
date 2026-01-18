import {
  FieldInvalid,
  NotFoundUser,
  WrongCredentials,
} from '@auth/domain/ports/primary/http/errors.port';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async executeUpdate(
    userID: string,
    newPassword: string,
    oldPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      userID,
    });

    if (user === undefined || user === null) throw new NotFoundUser();

    const oldPasswordVO = new PasswordHashedVO(
      user.password,
      this.passwordHasher,
    );
    if (!oldPasswordVO.comparePassword(oldPassword)) {
      throw new FieldInvalid(
        'A senha atual informada está incorreta.',
        'oldPassword',
      );
    }
    await this.updatePassword(user.userID, newPassword);
  }

  async executeReset(email: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      email,
    });

    if (user === undefined || user === null)
      throw new WrongCredentials('Token inválido ou expirado');

    await this.updatePassword(user.userID, newPassword);
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
