import { ValueObject } from '../../value-object';

export default class PhoneNumberVO extends ValueObject<
  string | undefined | null
> {
  constructor(value: string | undefined | null) {
    super(value);
  }
}
