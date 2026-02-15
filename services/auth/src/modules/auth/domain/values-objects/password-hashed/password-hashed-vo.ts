import { ValueObject } from '../value-object';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';

export default class PasswordHashedVO extends ValueObject<string> {
  private passwordHasher: PasswordHasher;

  constructor(value: string, passwordHasher: PasswordHasher) {
    super(value);
    this.passwordHasher = passwordHasher;
  }

  public async comparePassword(inputPassword: string) {
    return await this.passwordHasher.compare(inputPassword, this.value);
  }
}
