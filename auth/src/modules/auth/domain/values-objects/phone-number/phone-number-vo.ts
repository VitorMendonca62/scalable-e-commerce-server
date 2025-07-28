import { ValueObject } from '../value-object';
import { PhoneNumberValidator } from './phone-number-validator';

export default class PhoneNumberVO extends ValueObject {
  constructor(value: string, isOptional: boolean) {
    PhoneNumberValidator.isValid(value, isOptional);
    super();
    this.value = value;
  }
}
