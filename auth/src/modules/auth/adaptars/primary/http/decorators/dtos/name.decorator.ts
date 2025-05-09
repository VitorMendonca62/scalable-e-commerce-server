import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { applyDecorators } from '@nestjs/common';

export function Name(isOptional: boolean) {
  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: 'O nome completo é obrigatório',
      });

  return applyDecorators(
    IsRequired,
    IsString({ message: 'O nome completo deve ser uma string válida' }),
    MinLength(3, {
      message: 'O nome completo está muito curto. O mínimo são 3 caracteres',
    }),
  );
}
