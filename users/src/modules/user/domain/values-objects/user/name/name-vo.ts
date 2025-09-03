import { ValueObject } from '../../value-object';
import { NameValidator } from './name-validator';

export default class NameVO extends ValueObject {
  constructor(value: string, required: boolean) {
    super();
    NameValidator.validate(value, required);
    this.value = value;
  }
}
