import { ValueObject } from '../../value-object';

export default class ComplementVO extends ValueObject<string | undefined> {
  constructor(value: string | undefined) {
    super(value);
  }
}
