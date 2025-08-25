import { ValueObject } from '../../value-object';
import { PhoneNumberValidator } from './phone-number-validator';

export default class PhoneNumberVO extends ValueObject {
  constructor(value: string) {
    PhoneNumberValidator.validate(value);
    super();
    this.value = value;
  }
}
