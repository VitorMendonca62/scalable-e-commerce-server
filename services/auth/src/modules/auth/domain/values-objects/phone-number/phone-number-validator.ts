import { isEmpty, isPhoneNumber, isString, length } from 'class-validator';
import { PhoneNumberConstants } from './phone-number-constants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

export default class PhoneNumberValidator {
  static validate(value: string) {
    if (isEmpty(value)) return;

    if (!isString(value)) {
      throw new FieldInvalid(PhoneNumberConstants.ERROR_STRING, 'phoneNumber');
    }

    if (
      !length(value, PhoneNumberConstants.LENGTH, PhoneNumberConstants.LENGTH)
    ) {
      throw new FieldInvalid(PhoneNumberConstants.ERROR_LENGTH, 'phoneNumber');
    }

    if (!isPhoneNumber(value, 'BR')) {
      throw new FieldInvalid(PhoneNumberConstants.ERROR_INVALID, 'phoneNumber');
    }
  }
}
