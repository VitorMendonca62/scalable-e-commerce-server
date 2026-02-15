import PasswordHashedVO from '../password-hashed/password-hashed-vo';
import { ValueObject } from '../value-object';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';

export default class PasswordVO extends ValueObject<string> {
  private passwordHasher: PasswordHasher;

  constructor(value: string, passwordHasher: PasswordHasher) {
    super(value);
    this.passwordHasher = passwordHasher;
  }

  public static async createAndHash(
    plainPassword: string,
    passwordHasher: PasswordHasher,
  ): Promise<PasswordHashedVO> {
    const hashedValue = await passwordHasher.hash(plainPassword);
    return new PasswordHashedVO(hashedValue, passwordHasher);
  }

  public async comparePassword(inputPassword: string) {
    return await this.passwordHasher.compare(inputPassword, this.value);
  }
}
