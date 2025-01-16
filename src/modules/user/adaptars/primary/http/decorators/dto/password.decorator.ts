import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export function Password() {
  return applyDecorators(
    IsNotEmpty({
      message: 'A senha é obrigatória',
    }),
    IsString({ message: 'A senha deve ser uma string válida' }),
    MinLength(8, {
      message: 'A está está muito curta. O mínimo são 8 caracteres',
    }),
  );
}
