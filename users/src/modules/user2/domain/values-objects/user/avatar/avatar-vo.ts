import { ValueObject } from '../../value-object';
import { AvatarValidator } from './avatar-validator';

export default class AvatarVO extends ValueObject {
  constructor(value: string) {
    super();
    AvatarValidator.validate(value);
    this.value = value;
  }
}
