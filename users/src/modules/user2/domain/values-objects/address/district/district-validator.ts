import { isNotEmpty, isString } from 'class-validator';
import { DistrictConstants } from './district-constants';
import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';

export class DistrictValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(DistrictConstants.ERROR_REQUIRED, 'district');
    }

    if (!isString(value)) {
      throw new FieldInvalid(DistrictConstants.ERROR_STRING, 'district');
    }

    if (value.length < DistrictConstants.MIN_LENGTH) {
      throw new FieldInvalid(DistrictConstants.ERROR_TOO_SHORT, 'district');
    }

    if (value.length > DistrictConstants.MAX_LENGTH) {
      throw new FieldInvalid(DistrictConstants.ERROR_TOO_LONG, 'district');
    }

    const districtRegex = /^[a-zA-ZÀ-ÿ\s\-'()]+$/;
    if (!districtRegex.test(value)) {
      throw new FieldInvalid(DistrictConstants.ERROR_INVALID, 'district');
    }
  }
}
