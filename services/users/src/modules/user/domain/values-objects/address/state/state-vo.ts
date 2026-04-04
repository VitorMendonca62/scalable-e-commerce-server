import { ValueObject } from '../../value-object';

export default class StateVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}
