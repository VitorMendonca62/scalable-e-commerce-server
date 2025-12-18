import {
  NotFoundUser,
  WrongCredentials,
} from '@auth/domain/ports/primary/http/errors.port';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdatePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}
  async execute(
    userID: string,
    newPassword: string,
    oldPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      userID,
    });

    if (user == undefined || user == null) throw new NotFoundUser();

    const oldPasswordVO = new PasswordHashedVO(
      user.password,
      this.passwordHasher,
    );
    if (!oldPasswordVO.comparePassword(oldPassword)) {
      throw new WrongCredentials('A senha atual informada está incorreta.');
    }

    const newPasswordVO = new PasswordVO(newPassword, this.passwordHasher);

    await this.userRepository.update(user.userID, {
      password: newPasswordVO.getValue(),
    });
  }
}
