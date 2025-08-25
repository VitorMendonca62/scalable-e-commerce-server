import { ValueObject } from '../../value-object';
import { ComplementValidator } from './complement-validator';

export default class ComplementVO extends ValueObject {
  constructor(value: string | null) {
    super();
    ComplementValidator.validate(value);
    this.value = value;
  }
}
