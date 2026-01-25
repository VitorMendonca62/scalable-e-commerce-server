import { ValueObject } from '../../value-object';

export default class EmailVO extends ValueObject<string | undefined | null> {
  constructor(value: string | undefined | null) {
    super(value);
  }
}
