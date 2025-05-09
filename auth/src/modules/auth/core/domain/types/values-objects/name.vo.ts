import { isNotEmpty, isString } from 'class-validator';

export default class NameVO {
  private readonly value: string;

  constructor(value: string, isOptionalClient: boolean) {
    if (!NameVO.isValid(value, isOptionalClient)) {
      throw new Error('Nome inválido');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  static isValid(value: string, isOptionalClient: boolean): boolean {
    const IsRequiredOrNo = isOptionalClient ? true : isNotEmpty(value);

    return isString && IsRequiredOrNo && value.length >= 3;
  }
}
