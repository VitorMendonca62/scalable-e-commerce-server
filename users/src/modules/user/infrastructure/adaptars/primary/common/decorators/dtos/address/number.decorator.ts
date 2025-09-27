import { NumberConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export function Number() {
  return applyDecorators(
    IsNotEmpty({
      message: NumberConstants.ERROR_REQUIRED,
    }),
    IsString({ message: NumberConstants.ERROR_STRING }),
    MaxLength(NumberConstants.MAX_LENGTH, {
      message: NumberConstants.ERROR_TOO_LONG,
    }),
  );
}
