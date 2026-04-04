import { AvatarConstants } from '@user/domain/values-objects/user/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

export function ApiAvatar() {
  return applyDecorators(
    ApiPropertyOptional({
      description: AvatarConstants.DESCRIPTION,
      example: AvatarConstants.EXEMPLE,
    }),
  );
}
