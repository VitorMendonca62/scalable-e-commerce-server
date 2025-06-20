import { isNotEmpty, isPhoneNumber, isString, length } from 'class-validator';
import { PhoneNumberConstants } from './PhoneNumberConstants';

export class PhoneNumberValidator {
  static isValid(value: string, isOptionalClient: boolean): boolean {
    const isRequiredValid = isOptionalClient ? true : isNotEmpty(value);

    return (
      isRequiredValid &&
      isString(value) &&
      length(value, PhoneNumberConstants.LENGTH, PhoneNumberConstants.LENGTH) &&
      isPhoneNumber(value, 'BR')
    );
  }
}
