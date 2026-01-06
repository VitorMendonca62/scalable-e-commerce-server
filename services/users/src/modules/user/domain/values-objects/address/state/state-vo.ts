import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { ValueObject } from '../../value-object';
import { StateValidator } from './state-validator';

export default class StateVO extends ValueObject {
  constructor(value: string) {
    super();
    StateValidator.validate(value);
    this.value = value;
  }

  validateInPostalCode(postalCodeState: string) {
    if (postalCodeState.toLowerCase().trim() != this.value.toLowerCase()) {
      throw new FieldInvalid(
        'O estado informada não corresponde ao estado do CEP.',
        'state',
      );
    }
  }
}
