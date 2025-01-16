import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export function Name() {
  return applyDecorators(
    IsNotEmpty({
      message: 'O nome completo é obrigatório',
    }),
    IsString({ message: 'O nome completo deve ser uma string válida' }),
    MinLength(3, {
      message: 'O nome completo está muito curto. O mínimo são 3 caracteres',
    }),
  );
}
