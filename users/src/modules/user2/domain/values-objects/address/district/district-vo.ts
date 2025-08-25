import { ValueObject } from '../../value-object';
import { DistrictValidator } from './district-validator';

export default class DistrictVO extends ValueObject {
  constructor(value: string) {
    super();
    DistrictValidator.validate(value);
    this.value = value;
  }
}
