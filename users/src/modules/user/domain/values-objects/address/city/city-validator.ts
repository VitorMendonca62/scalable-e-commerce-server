import { isNotEmpty, isString } from 'class-validator';
import { CityConstants } from './city-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

export class CityValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(CityConstants.ERROR_REQUIRED, 'city');
    }

    if (!isString(value)) {
      throw new FieldInvalid(CityConstants.ERROR_STRING, 'city');
    }

    if (value.length < CityConstants.MIN_LENGTH) {
      throw new FieldInvalid(CityConstants.ERROR_TOO_SHORT, 'city');
    }

    if (value.length > CityConstants.MAX_LENGTH) {
      throw new FieldInvalid(CityConstants.ERROR_TOO_LONG, 'city');
    }

    const cityRegex = /^[a-zA-ZÀ-ÿ\s\-'()]+$/;
    if (!cityRegex.test(value)) {
      throw new FieldInvalid(CityConstants.ERROR_INVALID, 'city');
    }
  }
}
