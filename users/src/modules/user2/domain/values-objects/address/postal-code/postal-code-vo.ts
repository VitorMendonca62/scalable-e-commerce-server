import { ValueObject } from '../../value-object';
import { PostalCodeValidator } from './postal-code-validator';

export default class PostalCodeVO extends ValueObject {
  constructor(value: string) {
    super();
    PostalCodeValidator.validate(value);
    this.value = value;
  }
}
