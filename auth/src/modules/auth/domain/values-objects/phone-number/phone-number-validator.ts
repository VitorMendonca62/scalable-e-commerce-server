import { isNotEmpty, isPhoneNumber, isString, length } from 'class-validator';
import { PhoneNumberConstants } from './phone-number-constants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

export default class PhoneNumberValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(
        PhoneNumberConstants.ERROR_REQUIRED,
        'phonenumber',
      );
    }

    if (!isString(value)) {
      throw new FieldInvalid(PhoneNumberConstants.ERROR_STRING, 'phonenumber');
    }

    if (
      !length(value, PhoneNumberConstants.LENGTH, PhoneNumberConstants.LENGTH)
    ) {
      throw new FieldInvalid(PhoneNumberConstants.ERROR_LENGTH, 'phonenumber');
    }

    if (!isPhoneNumber(value, 'BR')) {
      throw new FieldInvalid(PhoneNumberConstants.ERROR_INVALID, 'phonenumber');
    }
  }
}
