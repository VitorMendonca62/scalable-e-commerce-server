import { ValueObject } from '../value-object';
import { UsernameValidator } from './username-validator';

export default class UsernameVO extends ValueObject {
  constructor(value: string, isOptional: boolean) {
    super();
    UsernameValidator.isValid(value, isOptional);
    this.value = value;
  }
}
