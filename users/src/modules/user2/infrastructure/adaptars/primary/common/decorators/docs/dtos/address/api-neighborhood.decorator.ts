import { NeighborhoodConstants } from '@modules/user2/domain/values-objects/address/neighborhood/neighborhood-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiNeighborhood(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: NeighborhoodConstants.DESCRIPTION,
      example: NeighborhoodConstants.EXEMPLE,
      required: required,
      minLength: NeighborhoodConstants.MIN_LENGTH,
      maxLength: NeighborhoodConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
