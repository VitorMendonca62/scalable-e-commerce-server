import { isNotEmpty, isPhoneNumber, isString } from 'class-validator';
import { FieldInvalid } from '../types/errors/errors';

export default class PhoneNumberVO {
  private value: string;

  static readonly DESCRIPTION =
    'O número de telefone serve como informação auxiliar para o sistema. Deve ser um número válido no Brasil!.';

  static readonly EXEMPLE = '+5581999999999';
  static readonly WRONG_EXEMPLE = '12345';
  static readonly MASK = '+55 (xx) xxxxx-xxxx';

  // ERRORS
  static readonly ERROR_REQUIRED = 'O telefone é obrigatório';
  static readonly ERROR_INVALID = 'O telefone deve ser válido do Brasil';
  static readonly ERROR_STRING = 'O telefone deve ser uma string';

  constructor(value: string, isOptionalClient: boolean) {
    if (!PhoneNumberVO.isValid(value, isOptionalClient)) {
      throw new FieldInvalid(PhoneNumberVO.ERROR_INVALID, 'phonenumber');
    }
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  static getFormattedValue(value: string): string {
    const formattedValue = value.replace(
      /(\d{2})(\d{5})(\d{4})/,
      `+55 ($1) $2-$3`,
    );
    return formattedValue;
  }

  toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }

  static isValid(value: string, isOptionalClient: boolean): boolean {
    const IsRequiredOrNo = isOptionalClient ? true : isNotEmpty(value);

    return (
      isNotEmpty(value) &&
      isString(value) &&
      isPhoneNumber(value, 'BR') &&
      IsRequiredOrNo
    );
  }
}
