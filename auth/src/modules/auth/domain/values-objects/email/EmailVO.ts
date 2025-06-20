import { FieldInvalid } from '../../types/errors/errors';
import { EmailConstants } from './EmailConstants';
import { EmailValidator } from './EmailValidator';

export default class EmailVO {
  private value: string;

  constructor(value: string) {
    if (!EmailValidator.isValid(value)) {
      throw new FieldInvalid(EmailConstants.ERROR_INVALID, 'email');
    }
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }
}
