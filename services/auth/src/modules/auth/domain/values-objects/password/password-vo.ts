import { ValueObject } from '../value-object';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';

export default class PasswordVO extends ValueObject<string> {
  private passwordHasher: PasswordHasher;

  constructor(
    value: string,
    canHashPassword: boolean,
    passwordHasher: PasswordHasher,
  ) {
    super(canHashPassword ? passwordHasher.hash(value) : value);
    this.passwordHasher = passwordHasher;
  }

  public comparePassword(inputPassword: string) {
    return this.passwordHasher.compare(inputPassword, this.value);
  }
}
