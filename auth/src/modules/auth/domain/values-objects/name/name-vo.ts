import { ValueObject } from '../value-object';
import { NameValidator } from './name-validator';

export default class NameVO extends ValueObject {
  constructor(value: string, isOptional: boolean) {
    super();
    NameValidator.isValid(value, isOptional);
    this.value = value;
  }
}
