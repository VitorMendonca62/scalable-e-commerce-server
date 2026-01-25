import { BrazilStates } from '@modules/user/domain/enums/brazil-ufs.enum';
import { ValueObject } from '../../value-object';

export default class StateVO extends ValueObject<BrazilStates> {
  constructor(value: BrazilStates) {
    super(value);
  }
}
