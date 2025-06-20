import { NameValidator } from './NameValidator';

export default class NameVO {
  private value: string;

  constructor(value: string, isOptionalClient: boolean) {
    NameValidator.isValid(value, isOptionalClient);
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }
}
