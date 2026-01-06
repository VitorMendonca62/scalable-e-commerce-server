import { isNotEmpty, isString, isUUID } from 'class-validator';
import { FieldInvalid } from '@auth/domain/ports/primary/http/errors.port';
import { IDConstants } from './id-constants';

export default class IDValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(IDConstants.ERROR_REQUIRED, 'id');
    }

    if (!isString(value)) {
      throw new FieldInvalid(IDConstants.ERROR_STRING, 'id');
    }

    if (!isUUID(value)) {
      throw new FieldInvalid(IDConstants.ERROR_INVALID, 'id');
    }
  }
}
