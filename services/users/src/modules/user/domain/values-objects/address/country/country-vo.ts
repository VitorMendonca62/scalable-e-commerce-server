import { ValueObject } from '../../value-object';

export default class CountryVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}
