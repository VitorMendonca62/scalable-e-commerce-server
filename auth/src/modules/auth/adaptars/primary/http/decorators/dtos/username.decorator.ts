import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';

export function Username(isOptional: boolean | undefined) {
  const IsRequiredOrNo = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: 'O username é obrigatório',
      });

  return applyDecorators(
    IsRequiredOrNo,
    IsString({ message: 'O username deve ser uma string válida' }),
    MinLength(3, {
      message: 'O username está muito curto. O mínimo são 3 caracteres',
    }),
    Matches(/^\S+$/, { message: 'O username não pode conter com espaços.' }),
  );
}
