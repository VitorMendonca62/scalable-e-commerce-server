import { isNotEmpty, isString, length } from 'class-validator';
import { NameConstants } from './name-constants';
import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';

export class NameValidator {
  static validate(value: string, required: boolean) {
    if (required && !isNotEmpty(value)) {
      throw new FieldInvalid(NameConstants.ERROR_REQUIRED, 'name');
    }

    if (!isString(value)) {
      throw new FieldInvalid(NameConstants.ERROR_STRING, 'name');
    }

    if (!length(value, NameConstants.MIN_LENGTH)) {
      throw new FieldInvalid(NameConstants.ERROR_MIN_LENGTH, 'name');
    }
  }
}
