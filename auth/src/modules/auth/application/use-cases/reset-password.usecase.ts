import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(email: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      email,
    });

    if (user == undefined || user == null)
      throw new WrongCredentials('Token inválido ou expirado1');

    const newPasswordVO = new PasswordVO(
      newPassword,
      true,
      this.passwordHasher,
    );

    await this.userRepository.update(user.userID, {
      password: newPasswordVO.getValue(),
    });
  }
}
