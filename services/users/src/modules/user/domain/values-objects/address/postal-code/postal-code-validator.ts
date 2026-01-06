import { isNotEmpty, isNumberString, isString } from 'class-validator';
import { PostalCodeConstants } from './postal-code-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

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

    if (!isNumberString(value)) {
      throw new FieldInvalid(PostalCodeConstants.ERROR_INVALID, 'postalCode');
    }
  }
}
