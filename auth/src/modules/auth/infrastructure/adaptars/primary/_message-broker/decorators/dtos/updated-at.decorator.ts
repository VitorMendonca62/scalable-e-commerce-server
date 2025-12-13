import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export function UpdatedAt() {
  return applyDecorators(
    IsNotEmpty({
      message: 'A data de atualização é obrigatória',
    }),
    IsNumberString(
      {},
      {
        message: 'A data de atualização deve ser uma String de números',
      },
    ),
  );
}
