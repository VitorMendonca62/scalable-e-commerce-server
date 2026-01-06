import { CountryConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiCountry( ) {
  return applyDecorators(
    ApiProperty({
      description: CountryConstants.DESCRIPTION,
      example: CountryConstants.EXEMPLE,
      required: true,
      minLength: CountryConstants.MIN_LENGTH,
      maxLength: CountryConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
