import { isString } from 'class-validator';
import { ComplementConstants } from './complement-constants';
import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';

export class ComplementValidator {
  static validate(value: string | null) {
    if (value === null || value === undefined) {
      return;
    }

    if (!isString(value)) {
      throw new FieldInvalid(ComplementConstants.ERROR_STRING, 'complement');
    }

    if (value.length > ComplementConstants.MAX_LENGTH) {
      throw new FieldInvalid(ComplementConstants.ERROR_TOO_LONG, 'complement');
    }

    if (value.trim().length > 0) {
      const complementRegex = /^[a-zA-ZÀ-ÿ0-9\s\-'()#.,]+$/;
      if (!complementRegex.test(value)) {
        throw new FieldInvalid(ComplementConstants.ERROR_INVALID, 'complement');
      }
    }
  }
}
