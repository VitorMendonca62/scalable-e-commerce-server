import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export function PhoneNumber() {
  return applyDecorators(
    IsNotEmpty({
      message: 'O telefone é obrigatório',
    }),
    IsPhoneNumber('BR', { message: 'O telefone deve ser do Brasil' }),
  );
}
