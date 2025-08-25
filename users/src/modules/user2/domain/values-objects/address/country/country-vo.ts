import { ValueObject } from '../../value-object';
import { CountryValidator } from './country-validator';

export default class CountryVO extends ValueObject {
  constructor(value: string) {
    super();
    CountryValidator.validate(value);
    this.value = value;
  }
}
