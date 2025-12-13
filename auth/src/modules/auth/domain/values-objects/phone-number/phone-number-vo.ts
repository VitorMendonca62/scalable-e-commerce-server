import { ValueObject } from '../value-object';
import PhoneNumberValidator from './phone-number-validator';

export default class PhoneNumberVO extends ValueObject<string> {
  constructor(value: string) {
    PhoneNumberValidator.validate(value);
    super(value);
  }
}
