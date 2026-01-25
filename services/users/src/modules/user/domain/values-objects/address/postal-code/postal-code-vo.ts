import { ValueObject } from '../../value-object';

export default class PostalCodeVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}
