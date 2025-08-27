import { isNotEmpty, isURL } from 'class-validator';
import { AvatarConstants } from './avatar-constants';
import { FieldInvalid } from '../../../ports/primary/http/error.port';

export class AvatarValidator {
  static validate(value: string, required: boolean) {
    if (required && !isNotEmpty(value)) {
      throw new FieldInvalid(AvatarConstants.ERROR_REQUIRED, 'avatar');
    }

    if (!isURL(value)) {
      throw new FieldInvalid(AvatarConstants.ERROR_INVALID, 'avatar');
    }

    if (value.length > AvatarConstants.MAX_LENGTH) {
      throw new FieldInvalid(AvatarConstants.ERROR_TOO_LONG, 'avatar');
    }
  }
}
