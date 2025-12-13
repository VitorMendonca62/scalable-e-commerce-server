import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export function CreatedAt() {
  return applyDecorators(
    IsNotEmpty({
      message: 'A data de criação é obrigatória',
    }),
    IsNumberString(
      {},
      {
        message: 'A data de criação deve ser uma String de números',
      },
    ),
  );
}
