import { PostalCodeConstants } from '@modules/user2/domain/values-objects/address/postal-code/postal-code-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiPostalCode(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: PostalCodeConstants.DESCRIPTION,
      example: PostalCodeConstants.EXEMPLE,
      required: required,
      minLength: PostalCodeConstants.LENGTH,
      maxLength: PostalCodeConstants.LENGTH,
      type: 'string',
    }),
  );
}
