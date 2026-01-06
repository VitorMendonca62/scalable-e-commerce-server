import { ValueObject } from '../value-object';
import { IDValidator } from './id-validator';

export default class IDVO extends ValueObject {
  constructor(value: string) {
    super();
    IDValidator.validate(value);
    this.value = value;
  }
}
