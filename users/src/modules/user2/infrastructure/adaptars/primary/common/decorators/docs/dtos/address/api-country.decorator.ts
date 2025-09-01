import { CountryConstants } from '@modules/user2/domain/values-objects/address/country/country-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiCountry(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: CountryConstants.DESCRIPTION,
      example: CountryConstants.EXEMPLE,
      required: required,
      minLength: CountryConstants.MIN_LENGTH,
      maxLength: CountryConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
