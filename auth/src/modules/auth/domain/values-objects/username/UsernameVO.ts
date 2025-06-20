import { HttpFieldInvalid } from '../../types/errors/errors';
import { UsernameConstants } from './UsernameConstants';
import { UsernameValidator } from './UsernameValidator';

export default class UsernameVO {
  private value: string;

  constructor(value: string, isOptionalClient: boolean) {
    if (!UsernameValidator.isValid(value, isOptionalClient)) {
      throw new HttpFieldInvalid(UsernameConstants.ERROR_INVALID, 'username');
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
