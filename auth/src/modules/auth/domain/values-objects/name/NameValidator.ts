import { isNotEmpty, isString, length } from 'class-validator';
import { NameConstants } from './NameConstants';
import { HttpFieldInvalid } from '../../types/errors/errors';

export class NameValidator {
  static isValid(value: string, isOptionalClient: boolean) {
    if (!isOptionalClient && !isNotEmpty(value)) {
      throw new HttpFieldInvalid(NameConstants.ERROR_REQUIRED, 'name');
    }

    if (!length(value, NameConstants.MIN_LENGTH)) {
      throw new HttpFieldInvalid(NameConstants.ERROR_MIN_LENGTH, 'name');
    }

    if (!isString(value)) {
      throw new HttpFieldInvalid(NameConstants.ERROR_INVALID, 'name');
    }
  }
}
