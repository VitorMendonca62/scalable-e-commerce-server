import { isNotEmpty, isString, isStrongPassword } from 'class-validator';
import * as bcrypt from 'bcryptjs';

export default class PasswordVO {
  private readonly value: string;

  static readonly DESCRIPTION =
    'A senha, que será criptografada assim que entra no sistema é utilizada para entrar no sistema. Ela deve conter um caracter especial, um número uma letra maiúscula e outra minúscula.';

  static readonly EXEMPLE = '$Vh1234567';
  static readonly WRONG_EXEMPLE = 'weak123';
  static readonly MIN_LENGTH = 8;
  static readonly MIN_LENGTH_EXEMPLE = 'abc';
  static readonly WEAK_EXEMPLE = 'adwawdawdwad';

  // ERRORS
  static readonly ERROR_REQUIRED = 'A senha é obrigatória';
  static readonly ERROR_INVALID = 'A senha deve ser uma string válida';
  static readonly ERROR_MIN_LENGTH =
    'A senha está está muito curta. O mínimo são 8 caracteres';
  static readonly ERROR_WEAK_PASSWORD = 'A senha está muito fraca';

  constructor(value: string, isStrongPassword: boolean) {
    if (!PasswordVO.isValid(value, isStrongPassword)) {
      throw new Error(PasswordVO.ERROR_INVALID);
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
      value.length >= this.MIN_LENGTH &&
      isStrongPasswordValid
    );
  }
}
