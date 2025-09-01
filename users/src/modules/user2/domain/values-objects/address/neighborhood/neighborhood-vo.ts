import { ValueObject } from '../../value-object';
import { NeighborhoodValidator } from './neighborhood-validator';

export default class NeighborhoodVO extends ValueObject {
  constructor(value: string) {
    super();
    NeighborhoodValidator.validate(value);
    this.value = value;
  }
}
