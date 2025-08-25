import { isNotEmpty, isString } from 'class-validator';
import { PostalCodeConstants } from './postal-code-constants';
import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';

export class PostalCodeValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(PostalCodeConstants.ERROR_REQUIRED, 'postalCode');
    }

    if (!isString(value)) {
      throw new FieldInvalid(PostalCodeConstants.ERROR_STRING, 'postalCode');
    }

    if (value.length != PostalCodeConstants.LENGTH) {
      throw new FieldInvalid(PostalCodeConstants.ERROR_LENGTH, 'postalCode');
    }

    const postalCodeRegex = /^\d{5}-?\d{3}$/;
    if (!postalCodeRegex.test(value)) {
      throw new FieldInvalid(PostalCodeConstants.ERROR_INVALID, 'postalCode');
    }
  }
}
