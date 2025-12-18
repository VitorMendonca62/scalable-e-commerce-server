import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export function EmailCode() {
  return applyDecorators(
    IsNotEmpty({ message: 'O código de recuperação é obrigatório.' }),
    IsString({ message: 'O código deve ser uma string válida.' }),
    Length(6, 6, {
      message: 'O código de recuperação deve ter exatamente 6 caracteres.',
    }),
  );
}
