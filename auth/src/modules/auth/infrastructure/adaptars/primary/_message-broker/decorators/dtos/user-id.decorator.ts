import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export function UserID() {
  return applyDecorators(
    IsNotEmpty({
      message: 'O id do usuário é obrigátorio.',
    }),
    IsString({
      message: 'O id do usuário deve ser uma string.',
    }),
    IsUUID('7', { message: 'O id do usuário deve ser do tipo UUID.' }),
  );
}
