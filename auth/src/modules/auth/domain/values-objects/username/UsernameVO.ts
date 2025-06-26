import { FieldInvalid } from '../../ports/primary/http/errors.port';
import { ValueObject } from '../ValueObject';
import { UsernameConstants } from './UsernameConstants';
import { UsernameValidator } from './UsernameValidator';

export default class UsernameVO extends ValueObject {
  constructor(value: string, isOptional: boolean) {
    if (!UsernameValidator.isValid(value, isOptional)) {
      throw new FieldInvalid(UsernameConstants.ERROR_STRING, 'username');
    }
    super();
    this.value = value;
  }

  toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }
}
