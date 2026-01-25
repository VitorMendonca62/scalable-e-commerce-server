import { ValueObject } from '../../value-object';
export default class NameVO extends ValueObject<string | undefined | null> {
  constructor(value: string | undefined | null) {
    super(value);
  }
}
