import { NeighborhoodConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiNeighborhood() {
  return applyDecorators(
    ApiProperty({
      description: NeighborhoodConstants.DESCRIPTION,
      example: NeighborhoodConstants.EXEMPLE,
      required: true,
      minLength: NeighborhoodConstants.MIN_LENGTH,
      maxLength: NeighborhoodConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
