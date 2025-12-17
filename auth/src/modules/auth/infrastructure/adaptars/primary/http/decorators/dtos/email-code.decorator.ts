import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export function EmailCode() {
  return applyDecorators(
    IsNotEmpty({ message: 'O código de verificação é obrigatório.' }),
    IsString({ message: 'O código deve ser uma string válida.' }),
    Length(6, 6, {
      message: 'O código de verificação deve ter exatamente 6 caracteres.',
    }),
  );
}
