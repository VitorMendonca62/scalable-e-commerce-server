import { ValueObject } from '../../value-object';
import { EmailValidator } from './email-validator';

export default class EmailVO extends ValueObject {
  constructor(value: string, required: boolean) {
    super();
    EmailValidator.validate(value, required);
    this.value = value;
  }
}
