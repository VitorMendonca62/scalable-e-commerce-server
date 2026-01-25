import { ValueObject } from '../value-object';

export default class IDVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}
