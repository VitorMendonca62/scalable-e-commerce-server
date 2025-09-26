import { AvatarConstants } from '@modules/user/domain/values-objects/user/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiAvatar() {
  return applyDecorators(
    ApiProperty({
      description: AvatarConstants.DESCRIPTION,
      example: AvatarConstants.EXEMPLE,
      required: true,
    }),
  );
}
