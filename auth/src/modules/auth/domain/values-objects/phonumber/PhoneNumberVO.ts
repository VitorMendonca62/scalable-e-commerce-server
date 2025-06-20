import { PhoneNumberValidator } from './PhoneNumberValidator';
import { FieldInvalid } from '../../types/errors/errors';
import { PhoneNumberConstants } from './PhoneNumberConstants';

export default class PhoneNumberVO {
  private value: string;

  constructor(value: string, isOptionalClient: boolean) {
    if (!PhoneNumberValidator.isValid(value, isOptionalClient)) {
      throw new FieldInvalid(PhoneNumberConstants.ERROR_INVALID, 'phonenumber');
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
