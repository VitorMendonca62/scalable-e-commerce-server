import { ValueObject } from '../value-object';
import { UsernameValidator } from './username-validator';

export default class UsernameVO extends ValueObject {
  constructor(value: string) {
    super();
    UsernameValidator.validate(value);
    this.value = value;
  }
}
