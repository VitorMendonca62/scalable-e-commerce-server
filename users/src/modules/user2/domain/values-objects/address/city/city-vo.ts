import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';
import { ValueObject } from '../../value-object';
import { CityValidator } from './city-validator';

export default class CityVO extends ValueObject {
  constructor(value: string) {
    super();
    CityValidator.validate(value);
    this.value = value;
  }

  validateInPostalCode(postalCodeCity: string) {
    if(postalCodeCity.toLowerCase().trim() != this.value.toLowerCase()) {
      throw new FieldInvalid("A cidade informada não corresponde à cidade do CEP.", "city")
    } 
  }
}
