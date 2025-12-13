import { ValueObject } from '../value-object';
import IDValidator from './id-validator';

export default class IDVO extends ValueObject<string> {
  constructor(value: string) {
    IDValidator.validate(value);
    super(value);
  }
}
