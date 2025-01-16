import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export function PhoneNumber() {
  return applyDecorators(
    IsNotEmpty({
      message: 'O telefone é obrigatório',
    }),
    IsPhoneNumber('BR', { message: 'O telefone deve ser válido do Brasil' }),
    IsString({ message: 'O telefone deve ser uma string' }),
  );
}
