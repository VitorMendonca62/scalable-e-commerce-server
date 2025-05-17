import { isNotEmpty, isString } from 'class-validator';

export default class UsernameVO {
  private readonly value: string;

  static readonly DESCRIPTION =
    'O apelido serve como identificador único de usuário e é utilizado para o usuário ser identificado no sistema';

  static readonly EXEMPLE = 'vitormendonca62';
  static readonly WRONG_EXEMPLE = 'us er';
  static readonly MIN_LENGTH = 3;

  // ERRORS
  static readonly ERROR_REQUIRED = 'O username é obrigatório';
  static readonly ERROR_INVALID = 'O username deve ser uma string válida';
  static readonly ERROR_MIN_LENGTH =
    'O username está muito curto. O mínimo são 3 caracteres';
  static readonly ERROR_NO_SPACES = 'O username não pode conter com espaços.';
  static readonly ERROR_ALREADY_EXISTS =
    'Esse username já está sendo utilizado. Tente outro';

  constructor(value: string, isOptionalClient: boolean) {
    if (!UsernameVO.isValid(value, isOptionalClient)) {
      throw new Error(UsernameVO.ERROR_INVALID);
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  static isValid(value: string, isOptionalClient: boolean): boolean {
    const IsRequiredOrNo = isOptionalClient ? true : isNotEmpty(value);
    const minLength = value.length >= this.MIN_LENGTH;
    const noSpaces = !/\s/.test(value);

    return isString(value) && IsRequiredOrNo && minLength && noSpaces;
  }
}
