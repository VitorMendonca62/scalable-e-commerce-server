import { isNotEmpty, isPhoneNumber, isString, length } from 'class-validator';
import { PhoneNumberConstants } from './PhoneNumberConstants';
import { HttpFieldInvalid } from '../../types/errors/errors';

export class PhoneNumberValidator {
  static isValid(value: string, isOptionalClient: boolean) {
    if (!isOptionalClient && !isNotEmpty(value)) {
      throw new HttpFieldInvalid(
        PhoneNumberConstants.ERROR_REQUIRED,
        'phonenumber',
      );
    }

    if (!isString(value)) {
      throw new HttpFieldInvalid(PhoneNumberConstants.ERROR_STRING, 'phonenumber');
    }

    if (
      !length(value, PhoneNumberConstants.LENGTH, PhoneNumberConstants.LENGTH)
    ) {
      throw new HttpFieldInvalid(PhoneNumberConstants.ERROR_LENGTH, 'phonenumber');
    }

    if (!isPhoneNumber(value, 'BR')) {
      throw new HttpFieldInvalid(PhoneNumberConstants.ERROR_INVALID, 'phonenumber');
    }
  }
}
