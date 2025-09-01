import { AvatarConstants } from '@modules/user2/domain/values-objects/user/avatar/avatar-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiAvatar(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: AvatarConstants.DESCRIPTION,
      example: AvatarConstants.EXEMPLE,
      required: required,
    }),
  );
}
