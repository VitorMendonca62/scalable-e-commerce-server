import { CityConstants } from '@modules/user2/domain/values-objects/address/city/city-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiCity(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: CityConstants.DESCRIPTION,
      example: CityConstants.EXEMPLE,
      required: required,
      minLength: CityConstants.MIN_LENGTH,
      maxLength: CityConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
