import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export default class BcryptPasswordHasher implements PasswordHasher {
  hash(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  compare(password: string, hashed: string): boolean {
    return bcrypt.compareSync(password, hashed);
  }
}
