import { StateConstants } from '@modules/user/domain/values-objects/address/constants';

import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export function State() {
  return applyDecorators(
    IsNotEmpty({
      message: StateConstants.ERROR_REQUIRED,
    }),
    IsString({ message: StateConstants.ERROR_STRING }),
    MinLength(StateConstants.MIN_LENGTH, {
      message: StateConstants.ERROR_TOO_SHORT,
    }),
    MaxLength(StateConstants.MAX_LENGTH, {
      message: StateConstants.ERROR_TOO_LONG,
    }),
  );
}
