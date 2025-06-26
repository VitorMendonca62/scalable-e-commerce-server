import { PhoneNumberValidator } from './PhoneNumberValidator';

export default class PhoneNumberVO {
  private value: string;

  constructor(value: string, isOptional: boolean) {
    PhoneNumberValidator.isValid(value, isOptional);
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }
}
