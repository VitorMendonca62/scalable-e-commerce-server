import { FieldInvalid, WrongCredentials } from '@modules/user2/domain/ports/primary/http/error.port';
import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class BearerTokenPipe implements PipeTransform {
  transform(value: string | undefined) {
    if (value === undefined || value === null) {
      throw new WrongCredentials();
    }
    if (!value.startsWith('Bearer')) {
      throw new WrongCredentials();
    }

    return value.replace('Bearer ', '');
  }
}
