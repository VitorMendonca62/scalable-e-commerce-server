import { FieldInvalid } from '@modules/auth/domain/ports/primary/http/errors.port';
import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class BearerTokenPipe implements PipeTransform {
  transform(value: string | undefined) {
    if (value === undefined || value === null) {
      // TODO Nao deveria ser fieldINvalid, e sim um 401
      throw new FieldInvalid('Você não tem permissão', 'refresh_token');
    }
    if (!value.startsWith('Bearer')) {
      throw new FieldInvalid('Você não tem permissão', 'refresh_token');
    }

    return value.replace('Bearer ', '');
  }
}
