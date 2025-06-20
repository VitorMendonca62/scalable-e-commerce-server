import { FieldInvalid } from '../../types/errors/errors';
import { NameConstants } from './NameConstants';
import { NameValidator } from './NameValidator';

export default class NameVO {
  private value: string;

  constructor(value: string, isOptionalClient: boolean) {
    if (!NameValidator.isValid(value, isOptionalClient)) {
      throw new FieldInvalid(NameConstants.ERROR_INVALID, 'name');
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
