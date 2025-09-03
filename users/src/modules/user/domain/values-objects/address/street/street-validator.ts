import { isNotEmpty, isString } from 'class-validator';
import { StreetConstants } from './street-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

export class StreetValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(StreetConstants.ERROR_REQUIRED, 'street');
    }

    if (!isString(value)) {
      throw new FieldInvalid(StreetConstants.ERROR_STRING, 'street');
    }

    if (value.length < StreetConstants.MIN_LENGTH) {
      throw new FieldInvalid(StreetConstants.ERROR_TOO_SHORT, 'street');
    }

    if (value.length > StreetConstants.MAX_LENGTH) {
      throw new FieldInvalid(StreetConstants.ERROR_TOO_LONG, 'street');
    }

    const streetRegex = /^[a-zA-ZÀ-ÿ\s\-'()\.]+$/;
    if (!streetRegex.test(value)) {
      throw new FieldInvalid(StreetConstants.ERROR_INVALID, 'street');
    }
  }
}
