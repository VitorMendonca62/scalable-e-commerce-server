import { ValueObject } from '../../value-object';

export default class NeighborhoodVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}
