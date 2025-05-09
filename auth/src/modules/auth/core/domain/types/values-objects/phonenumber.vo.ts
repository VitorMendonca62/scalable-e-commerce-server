import { isNotEmpty, isPhoneNumber, isString } from 'class-validator';

export default class PhoneNumberVO {
  private readonly value: string;
  private readonly mask: string = '+55 (xx) xxxxx-xxxx';

  constructor(value: string, isOptionalClient: boolean) {
    if (!PhoneNumberVO.isValid(value, isOptionalClient)) {
      throw new Error('Número de telefone inválido');
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
