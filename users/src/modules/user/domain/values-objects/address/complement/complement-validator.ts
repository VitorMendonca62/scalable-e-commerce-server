import { isEmpty, isString } from 'class-validator';
import { ComplementConstants } from './complement-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

export class ComplementValidator {
  static validate(value: string | null) {
    if (value === null || value === undefined || isEmpty(value)) {
      return;
    }

    if (!isString(value)) {
      throw new FieldInvalid(ComplementConstants.ERROR_STRING, 'complement');
    }

    if (value.length > ComplementConstants.MAX_LENGTH) {
      throw new FieldInvalid(ComplementConstants.ERROR_TOO_LONG, 'complement');
    }

    const complementRegex = /^[a-zA-ZÀ-ÿ0-9\s\-'(),\.º]+$/;
    if (!complementRegex.test(value)) {
      throw new FieldInvalid(ComplementConstants.ERROR_INVALID, 'complement');
    }
  }
}
