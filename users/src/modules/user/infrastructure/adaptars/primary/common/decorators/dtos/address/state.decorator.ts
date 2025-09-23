import { StateConstants } from '@modules/user/domain/values-objects/address/constants';

import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export function State(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: StateConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: StateConstants.ERROR_STRING }),
    MinLength(StateConstants.MIN_LENGTH, {
      message: StateConstants.ERROR_TOO_SHORT,
    }),
    MaxLength(StateConstants.MAX_LENGTH, {
      message: StateConstants.ERROR_TOO_LONG,
    }),
  );
}
