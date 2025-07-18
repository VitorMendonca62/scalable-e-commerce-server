import * as bcrypt from 'bcryptjs';
import { PasswordValidator } from './PasswordValidator';
import { ValueObject } from '../ValueObject';

export default class PasswordVO extends ValueObject {
  constructor(
    value: string,
    isStrongPassword: boolean,
    isOptional: boolean,
    hasherPassword: boolean,
  ) {
    super();
    PasswordValidator.isValid(value, isStrongPassword, isOptional);

    this.value = hasherPassword ? this.hashPassword(value) : value;
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
