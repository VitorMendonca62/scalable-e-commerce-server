import { ValueObject } from '../../value-object';

export default class IDVO extends ValueObject<string | undefined | null> {
  constructor(value: string | undefined | null) {
    super(value);
  }
}
