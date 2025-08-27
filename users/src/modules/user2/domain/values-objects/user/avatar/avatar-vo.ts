import { ValueObject } from '../../value-object';
import { AvatarValidator } from './avatar-validator';

export default class AvatarVO extends ValueObject {
  constructor(value: string, required: boolean) {
    super();
    AvatarValidator.validate(value, required);
    this.value = value;
  }
}
