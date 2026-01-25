import { ValueObject } from '../../value-object';

export default class CityVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}
