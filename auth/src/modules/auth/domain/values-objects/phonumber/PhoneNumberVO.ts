import { PhoneNumberValidator } from './PhoneNumberValidator';

export default class PhoneNumberVO {
  private value: string;

  constructor(value: string, isOptionalClient: boolean) {
    PhoneNumberValidator.isValid(value, isOptionalClient);
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }
}
