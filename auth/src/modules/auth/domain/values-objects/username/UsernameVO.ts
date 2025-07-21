import { ValueObject } from '../ValueObject';
import { UsernameValidator } from './UsernameValidator';

export default class UsernameVO extends ValueObject {
  constructor(value: string, isOptional: boolean) {
    super();
    UsernameValidator.isValid(value, isOptional);
    this.value = value;
  }
}
