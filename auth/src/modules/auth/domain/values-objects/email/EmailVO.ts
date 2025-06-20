import { EmailValidator } from './EmailValidator';

export default class EmailVO {
  private value: string;

  constructor(value: string) {
    EmailValidator.isValid(value);
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public toLowerCase(): void {
    this.value = this.value.toLowerCase();
  }
}
