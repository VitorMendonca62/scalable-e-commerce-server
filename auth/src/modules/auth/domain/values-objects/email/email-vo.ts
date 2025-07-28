import { ValueObject } from '../value-object';
import { EmailValidator } from './email-validator';

export default class EmailVO extends ValueObject {
  constructor(value: string) {
    super();
    EmailValidator.validate(value);
    this.value = value;
  }
}
