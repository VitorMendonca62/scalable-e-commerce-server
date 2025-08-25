import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiStatusCode(example: number = HttpStatus.OK) {
  return applyDecorators(
    ApiProperty({
      description: 'Código HTTP retornado',
      example,
      enum: HttpStatus,
      required: true,
      type: 'number',
    }),
  );
}
