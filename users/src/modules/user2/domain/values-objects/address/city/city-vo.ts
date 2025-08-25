import { ValueObject } from '../../value-object';
import { CityValidator } from './city-validator';

export default class CityVO extends ValueObject {
  constructor(value: string) {
    super();
    CityValidator.validate(value);
    this.value = value;
  }
}
