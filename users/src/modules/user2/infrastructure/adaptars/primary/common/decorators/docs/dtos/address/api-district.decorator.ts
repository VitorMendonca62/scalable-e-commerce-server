import { DistrictConstants } from '@modules/user2/domain/values-objects/address/district/district-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiDistrict(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: DistrictConstants.DESCRIPTION,
      example: DistrictConstants.EXEMPLE,
      required: required,
      minLength: DistrictConstants.MIN_LENGTH,
      maxLength: DistrictConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
