import * as bcrypt from 'bcryptjs';
import { FieldInvalid } from '../../types/errors/errors';
import { PasswordConstants } from './PasswordConstants';
import { PasswordValidator } from './PasswordValidator';

export default class PasswordVO {
  private value: string;

  constructor(value: string, isStrongPassword: boolean) {
    if (!PasswordValidator.isValid(value, isStrongPassword)) {
      throw new FieldInvalid(PasswordConstants.ERROR_INVALID, 'password');
    }
    this.value = this.hashPassword(value);
  }

  public getValue(): string {
    return this.value;
  }

  // TODO Criar uma classe só para isso
  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  public comparePassword(inputPassword: string) {
    return bcrypt.compareSync(inputPassword, this.value);
  }

  toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }
}
