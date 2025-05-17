import { isNotEmpty, isString } from 'class-validator';

export default class NameVO {
  private readonly value: string;

  static readonly DESCRIPTION =
    'O nome completo do usuário. Serve como informação auxiliar para o sistema';

  static readonly EXEMPLE = 'Vitor Hugo Mendonça de Queiroz';
  static readonly WRONG_EXEMPLE = 'Vi';
  static readonly MIN_LENGTH = 3;
  static readonly MIN_LENGTH_EXEMPLE = 'ab';

  // ERRORS
  static readonly ERROR_REQUIRED = 'O nome completo é obrigatório';
  static readonly ERROR_INVALID = 'O nome completo deve ser uma string válida';
  static readonly ERROR_MIN_LENGTH =
    'O nome completo está muito curto. O mínimo são 3 caracteres';

  constructor(value: string, isOptionalClient: boolean) {
    if (!NameVO.isValid(value, isOptionalClient)) {
      throw new Error(NameVO.ERROR_INVALID);
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  static isValid(value: string, isOptionalClient: boolean): boolean {
    const IsRequiredOrNo = isOptionalClient ? true : isNotEmpty(value);
    const minLength = value.length >= this.MIN_LENGTH;

    return isString(value) && IsRequiredOrNo && minLength;
  }
}
