import { ValueObject } from '../../value-object';
import { NumberValidator } from './number-validator';

export default class NumberVO extends ValueObject {
  constructor(value: string) {
    super();
    NumberValidator.validate(value);
    this.value = value;
  }
}
