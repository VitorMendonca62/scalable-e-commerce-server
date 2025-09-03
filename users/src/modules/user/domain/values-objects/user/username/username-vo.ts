import { ValueObject } from '../../value-object';
import { UsernameValidator } from './username-validator';

export default class UsernameVO extends ValueObject {
  constructor(value: string, required: boolean) {
    super();
    UsernameValidator.validate(value, required);
    this.value = value;
  }
}
