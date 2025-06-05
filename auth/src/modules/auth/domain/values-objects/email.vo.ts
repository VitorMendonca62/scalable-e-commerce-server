import { isEmail } from 'class-validator';
import { FieldInvalid } from '../types/errors/errors';

export default class EmailVO {
  private readonly value: string;

  static readonly DESCRIPTION =
    'O email serve como identificador único de usuário e utiliza-se para entrar no sistema';

  static readonly EXEMPLE = 'vitorqueiroz325@gmamil.com';
  static readonly WRONG_EXEMPLE = 'invalid.email';

  // ERRORS
  static readonly ERROR_REQUIRED = 'O email é obrigatório';
  static readonly ERROR_INVALID = 'O email deve ser válido';
  static readonly ERROR_ALREADY_EXISTS =
    'Esse email já está sendo utilizado. Tente outro';

  constructor(value: string) {
    if (!EmailVO.isValid(value)) {
      throw new FieldInvalid(EmailVO.ERROR_INVALID, 'email');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  static isValid(value: string): boolean {
    return isEmail(value);
  }
}
