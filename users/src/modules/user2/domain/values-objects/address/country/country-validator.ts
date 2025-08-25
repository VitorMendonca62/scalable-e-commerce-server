import { isNotEmpty, isString } from 'class-validator';
import { CountryConstants } from './country-constants';
import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';

export class CountryValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(CountryConstants.ERROR_REQUIRED, 'country');
    }

    if (!isString(value)) {
      throw new FieldInvalid(CountryConstants.ERROR_STRING, 'country');
    }

    if (value.length < CountryConstants.MIN_LENGTH) {
      throw new FieldInvalid(CountryConstants.ERROR_TOO_SHORT, 'country');
    }

    if (value.length > CountryConstants.MAX_LENGTH) {
      throw new FieldInvalid(CountryConstants.ERROR_TOO_LONG, 'country');
    }

    const countryRegex = /^[a-zA-ZÀ-ÿ\s\-'()]+$/;
    if (!countryRegex.test(value)) {
      throw new FieldInvalid(CountryConstants.ERROR_INVALID, 'country');
    }
  }
}
