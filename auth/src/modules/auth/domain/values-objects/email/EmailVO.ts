import { ValueObject } from '../ValueObject';
import { EmailValidator } from './EmailValidator';

export default class EmailVO extends ValueObject {
  constructor(value: string) {
    super();
    EmailValidator.isValid(value);
    this.value = value;
  }
}
