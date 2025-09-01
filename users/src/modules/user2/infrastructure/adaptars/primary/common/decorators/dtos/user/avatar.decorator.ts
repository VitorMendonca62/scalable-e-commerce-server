import { AvatarConstants } from '@modules/user2/domain/values-objects/user/avatar/avatar-constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

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
  );
}
