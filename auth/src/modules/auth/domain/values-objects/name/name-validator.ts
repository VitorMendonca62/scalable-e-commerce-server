import { isNotEmpty, isString, length } from 'class-validator';
import { NameConstants } from './name-constants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

export class NameValidator {
  static isValid(value: string, isOptional: boolean) {
    if (!isOptional && !isNotEmpty(value)) {
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
