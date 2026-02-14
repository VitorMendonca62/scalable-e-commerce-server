import { PasswordHasher } from '@modules/user/domain/ports/secondary/password-hasher.port';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export default class BcryptPasswordHasher implements PasswordHasher {
  hash(password: string): string {
    return bcrypt.hashSync(password, 10);
  }
}
