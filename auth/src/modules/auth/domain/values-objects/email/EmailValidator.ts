import { isEmail } from 'class-validator';

export class EmailValidator {
  static isValid(value: string): boolean {
    return isEmail(value);
  }
}
