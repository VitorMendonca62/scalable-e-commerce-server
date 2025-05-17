import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import PasswordVO from '@modules/auth/core/domain/types/values-objects/password.vo';

export function ApiPassword(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: PasswordVO.DESCRIPTION,
      example: PasswordVO.EXEMPLE,
      required: required,
      minLength: PasswordVO.MIN_LENGTH,
    }),
  );
}
