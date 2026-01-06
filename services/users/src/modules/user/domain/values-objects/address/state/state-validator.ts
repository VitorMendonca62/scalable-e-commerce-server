import { isNotEmpty, isString } from 'class-validator';
import { StateConstants } from './state-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

export class StateValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(StateConstants.ERROR_REQUIRED, 'state');
    }

    if (!isString(value)) {
      throw new FieldInvalid(StateConstants.ERROR_STRING, 'state');
    }

    if (value.length < StateConstants.MIN_LENGTH) {
      throw new FieldInvalid(StateConstants.ERROR_TOO_SHORT, 'state');
    }

    if (value.length > StateConstants.MAX_LENGTH) {
      throw new FieldInvalid(StateConstants.ERROR_TOO_LONG, 'state');
    }

    const stateRegex = /^[a-zA-ZÀ-ÿ\s\-'()]+$/;
    if (!stateRegex.test(value)) {
      throw new FieldInvalid(StateConstants.ERROR_INVALID, 'state');
    }
  }
}
