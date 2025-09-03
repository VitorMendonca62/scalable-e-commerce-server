import { isNotEmpty, isString } from 'class-validator';
import { NumberConstants } from './number-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

export class NumberValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(NumberConstants.ERROR_REQUIRED, 'number');
    }

    if (!isString(value)) {
      throw new FieldInvalid(NumberConstants.ERROR_STRING, 'number');
    }

    if (value.length < NumberConstants.MIN_LENGTH) {
      throw new FieldInvalid(NumberConstants.ERROR_TOO_SHORT, 'number');
    }

    if (value.length > NumberConstants.MAX_LENGTH) {
      throw new FieldInvalid(NumberConstants.ERROR_TOO_LONG, 'number');
    }
  }
}
