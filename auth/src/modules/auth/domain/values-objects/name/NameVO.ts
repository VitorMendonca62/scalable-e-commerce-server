import { ValueObject } from '../ValueObject';
import { NameValidator } from './NameValidator';

export default class NameVO extends ValueObject {
  constructor(value: string, isOptional: boolean) {
    super();
    NameValidator.isValid(value, isOptional);
    this.value = value;
  }

  public toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }
}
