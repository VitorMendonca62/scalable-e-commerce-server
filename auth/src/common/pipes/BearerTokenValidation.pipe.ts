import { FieldInvalid } from '@modules/auth/domain/ports/primary/http/errors.port';
import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class BearerTokenValidationPipe implements PipeTransform {
  transform(value: string) {
    if (!value) {
      throw new FieldInvalid('Você não tem permissão', 'refresh_token');
    }
    if (!value.startsWith('Bearer')) {
      throw new FieldInvalid('Você não tem permissão', 'refresh_token');
    }

    return value.replace('Bearer ', '');
  }
}
