import { ValueObject } from '../ValueObject';
import { PhoneNumberValidator } from './PhoneNumberValidator';

export default class PhoneNumberVO extends ValueObject {
  constructor(value: string, isOptional: boolean) {
    PhoneNumberValidator.isValid(value, isOptional);
    super();
    this.value = value;
  }

  public toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }
}
