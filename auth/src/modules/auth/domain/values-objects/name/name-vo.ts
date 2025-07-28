import { ValueObject } from '../value-object';
import { NameValidator } from './name-validator';

export default class NameVO extends ValueObject {
  constructor(value: string) {
    super();
    NameValidator.validate(value);
    this.value = value;
  }
}
