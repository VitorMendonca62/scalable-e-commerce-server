import { ValueObject } from '../value-object';

export default class EmailVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}
