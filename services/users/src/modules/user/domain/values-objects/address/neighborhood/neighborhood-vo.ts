import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { ValueObject } from '../../value-object';
import { NeighborhoodValidator } from './neighborhood-validator';

export default class NeighborhoodVO extends ValueObject {
  constructor(value: string) {
    super();
    NeighborhoodValidator.validate(value);
    this.value = value;
  }

  validateInPostalCode(postalCodeNeighborhood: string) {
    if(postalCodeNeighborhood.toLowerCase().trim() != this.value.toLowerCase()) {
      throw new FieldInvalid("O bairro informada não corresponde ao bairro do CEP.", "neighborhood")
    } 
  }
}
