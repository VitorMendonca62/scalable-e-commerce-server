import { ComplementConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export function Complement() {
  return applyDecorators(
    IsOptional(),
    IsString({ message: ComplementConstants.ERROR_STRING }),
    MaxLength(ComplementConstants.MAX_LENGTH, {
      message: ComplementConstants.ERROR_TOO_LONG,
    }),
  );
}
