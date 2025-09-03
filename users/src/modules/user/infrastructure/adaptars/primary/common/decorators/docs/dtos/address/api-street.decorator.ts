import { StreetConstants } from '@user/domain/values-objects/address/street/street-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiStreet(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: StreetConstants.DESCRIPTION,
      example: StreetConstants.EXEMPLE,
      required: required,
      minLength: StreetConstants.MIN_LENGTH,
      maxLength: StreetConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
