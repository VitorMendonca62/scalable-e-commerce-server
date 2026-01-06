import {
  isEmpty,
  isNotEmpty,
  isString,
  isURL,
  maxLength,
} from 'class-validator';
import { AvatarConstants } from './avatar-constants';
import { FieldInvalid } from '../../../ports/primary/http/error.port';

export class AvatarValidator {
  static validate(value: string, required: boolean) {
    if (!required && isEmpty(value)) return;

    if (required && isEmpty(value)) {
      throw new FieldInvalid(AvatarConstants.ERROR_REQUIRED, 'avatar');
    }

    if (!isString(value)) {
      throw new FieldInvalid(AvatarConstants.ERROR_STRING, 'avatar');
    }

    if (!isURL(value)) {
      throw new FieldInvalid(AvatarConstants.ERROR_INVALID, 'avatar');
    }

    if (!maxLength(value, AvatarConstants.MAX_LENGTH)) {
      throw new FieldInvalid(AvatarConstants.ERROR_TOO_LONG, 'avatar');
    }
  }
}
