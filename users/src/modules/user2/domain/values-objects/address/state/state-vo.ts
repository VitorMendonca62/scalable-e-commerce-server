import { ValueObject } from '../../value-object';
import { StateValidator } from './state-validator';

export default class StateVO extends ValueObject {
  constructor(value: string) {
    super();
    StateValidator.validate(value);
    this.value = value;
  }
}
