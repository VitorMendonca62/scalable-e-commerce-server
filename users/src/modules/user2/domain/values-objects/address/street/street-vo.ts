import { ValueObject } from '../../value-object';
import { StreetValidator } from './street-validator';

export default class StreetVO extends ValueObject {
  constructor(value: string) {
    super();
    StreetValidator.validate(value);
    this.value = value;
  }
}
