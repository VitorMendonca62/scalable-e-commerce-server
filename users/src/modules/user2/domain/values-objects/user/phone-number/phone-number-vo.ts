import { ValueObject } from '../../value-object';
import { PhoneNumberValidator } from './phone-number-validator';

export default class PhoneNumberVO extends ValueObject {
  constructor(value: string, required: boolean) {
    PhoneNumberValidator.validate(value, required);
    super();
    this.value = value;
  }
}
