import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export function Username() {
  return applyDecorators(
    IsNotEmpty({
      message: 'O username é obrigatório',
    }),
    IsString({ message: 'O username deve ser uma string válida' }),
    MinLength(3, {
      message: 'O username está muito curto. O mínimo são 3 caracteres',
    }),
  );
}
