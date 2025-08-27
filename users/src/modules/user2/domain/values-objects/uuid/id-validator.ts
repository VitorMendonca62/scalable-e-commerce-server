import { isNotEmpty, isString, isUUID, length } from 'class-validator';
import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';
import { IDConstants } from './id-constants';

export class IDValidator {
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
