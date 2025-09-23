import { AvatarConstants } from '@modules/user/domain/values-objects/user/constants';
import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export function Avatar(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: AvatarConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: AvatarConstants.ERROR_STRING }),
    IsUrl({}, { message: AvatarConstants.ERROR_INVALID }),
    MaxLength(AvatarConstants.MAX_LENGTH, {
      message: AvatarConstants.ERROR_TOO_LONG,
    }),
  );
}
