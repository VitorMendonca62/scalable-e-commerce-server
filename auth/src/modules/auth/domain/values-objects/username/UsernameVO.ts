import { FieldInvalid } from '../../ports/primary/http/errors.port';
import { UsernameConstants } from './UsernameConstants';
import { UsernameValidator } from './UsernameValidator';

export default class UsernameVO {
  private value: string;

  constructor(value: string, isOptional: boolean) {
    if (!UsernameValidator.isValid(value, isOptional)) {
      throw new FieldInvalid(UsernameConstants.ERROR_STRING, 'username');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }
}
