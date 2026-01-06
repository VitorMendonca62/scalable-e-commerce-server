import { ValueObject } from '../value-object';
import EmailValidator from './email-validator';

export default class EmailVO extends ValueObject<string> {
  constructor(value: string) {
    EmailValidator.validate(value);
    super(value);
  }
}
