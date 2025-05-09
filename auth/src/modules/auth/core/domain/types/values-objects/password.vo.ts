import { isNotEmpty, isString, isStrongPassword } from 'class-validator';
import * as bcrypt from 'bcryptjs';

export default class PasswordVO {
  private readonly value: string;

  constructor(value: string, isStrongPassword: boolean) {
    if (!PasswordVO.isValid(value, isStrongPassword)) {
      throw new Error('Senha inválida');
    }
    this.value = this.hashPassword(value);
  }

  public getValue(): string {
    return this.value;
  }

  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  public comparePassword(inputPassword: string) {
    return bcrypt.compareSync(inputPassword, this.value);
  }

  static isValid(value: string, isStrongPasswordClient: boolean): boolean {
    const isStrongPasswordValid = isStrongPasswordClient
      ? isStrongPassword(value, {
          minLowercase: 1,
          minSymbols: 1,
          minUppercase: 1,
          minNumbers: 1,
        })
      : true;

    return (
      isNotEmpty(value) &&
      isString(value) &&
      value.length >= 8 &&
      isStrongPasswordValid
    );
  }
}
