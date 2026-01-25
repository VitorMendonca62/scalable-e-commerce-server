import { NeighborhoodConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export function Neighborhood() {
  return applyDecorators(
    IsNotEmpty({
      message: NeighborhoodConstants.ERROR_REQUIRED,
    }),
    IsString({ message: NeighborhoodConstants.ERROR_STRING }),
    MinLength(NeighborhoodConstants.MIN_LENGTH, {
      message: NeighborhoodConstants.ERROR_TOO_SHORT,
    }),
    MaxLength(NeighborhoodConstants.MAX_LENGTH, {
      message: NeighborhoodConstants.ERROR_TOO_LONG,
    }),
  );
}
