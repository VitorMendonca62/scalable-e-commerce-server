import { ValueObject } from '../../value-object';

export default class StreetVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}
