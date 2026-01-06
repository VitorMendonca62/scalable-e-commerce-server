import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { ValueObject } from '../../value-object';
import { StreetValidator } from './street-validator';

export default class StreetVO extends ValueObject {
  constructor(value: string) {
    super();
    StreetValidator.validate(value);
    this.value = value;
  }

  validateInPostalCode(postalCodeStreet: string) {
    if(postalCodeStreet.toLowerCase().trim() != this.value.toLowerCase()) {
      throw new FieldInvalid("A rua informada não corresponde à rua do CEP.", "street")
    } 
  }
}
