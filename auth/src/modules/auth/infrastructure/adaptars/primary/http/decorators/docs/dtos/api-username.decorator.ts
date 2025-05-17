import UsernameVO from '@modules/auth/domain/values-objects/username.vo';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiUsername(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: UsernameVO.DESCRIPTION,
      example: UsernameVO.EXEMPLE,
      required: required,
      minLength: UsernameVO.MIN_LENGTH,
    }),
  );
}
