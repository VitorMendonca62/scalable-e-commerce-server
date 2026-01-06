import { isNotEmpty, isString } from 'class-validator';
import { NeighborhoodConstants } from './neighborhood-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

export class NeighborhoodValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(NeighborhoodConstants.ERROR_REQUIRED, 'district');
    }

    if (!isString(value)) {
      throw new FieldInvalid(NeighborhoodConstants.ERROR_STRING, 'district');
    }

    if (value.length < NeighborhoodConstants.MIN_LENGTH) {
      throw new FieldInvalid(NeighborhoodConstants.ERROR_TOO_SHORT, 'district');
    }

    if (value.length > NeighborhoodConstants.MAX_LENGTH) {
      throw new FieldInvalid(NeighborhoodConstants.ERROR_TOO_LONG, 'district');
    }

    const districtRegex = /^[a-zA-ZÀ-ÿ\s\-'()]+$/;
    if (!districtRegex.test(value)) {
      throw new FieldInvalid(NeighborhoodConstants.ERROR_INVALID, 'district');
    }
  }
}
