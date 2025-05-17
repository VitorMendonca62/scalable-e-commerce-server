import NameVO from '@modules/auth/core/domain/types/values-objects/name.vo';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiName(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: NameVO.DESCRIPTION,
      example: NameVO.EXEMPLE,
      required: required,
      minLength: NameVO.MIN_LENGTH,
    }),
  );
}
