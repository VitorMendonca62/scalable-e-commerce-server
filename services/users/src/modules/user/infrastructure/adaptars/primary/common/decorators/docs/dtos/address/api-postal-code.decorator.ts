import { PostalCodeConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiPostalCode() {
  return applyDecorators(
    ApiProperty({
      description: PostalCodeConstants.DESCRIPTION,
      example: PostalCodeConstants.EXEMPLE,
      required: true,
      minLength: PostalCodeConstants.LENGTH,
      maxLength: PostalCodeConstants.LENGTH,
      type: 'string',
    }),
  );
}
