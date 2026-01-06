import { CityConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiCity( ) {
  return applyDecorators(
    ApiProperty({
      description: CityConstants.DESCRIPTION,
      example: CityConstants.EXEMPLE,
      required: true,
      minLength: CityConstants.MIN_LENGTH,
      maxLength: CityConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
