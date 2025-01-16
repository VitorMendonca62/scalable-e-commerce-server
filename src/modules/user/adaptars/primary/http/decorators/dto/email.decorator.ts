import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty } from 'class-validator';

export function Email() {
  return applyDecorators(
    IsNotEmpty({
      message: 'O email é obrigatório',
    }),
    IsEmail({}, { message: 'O email tem que ser válido' }),
  );
}
