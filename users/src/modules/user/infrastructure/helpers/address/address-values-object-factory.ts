import {
  NumberConstants,
  StreetConstants,
  ComplementConstants,
  NeighborhoodConstants,
  CityConstants,
  PostalCodeConstants,
  StateConstants,
  CountryConstants,
} from '@modules/user/domain/values-objects/address/constants';
import {
  NumberVO,
  StreetVO,
  ComplementVO,
  NeighborhoodVO,
  CityVO,
  PostalCodeVO,
  StateVO,
  CountryVO,
} from '@modules/user/domain/values-objects/address/values-object';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import IDVO from '@modules/user/domain/values-objects/uuid/id-vo';
import { ValueObject } from '@modules/user/domain/values-objects/value-object';

type AddressValuesObjectKey =
  | 'userId'
  | 'street'
  | 'number'
  | 'complement'
  | 'neighborhood'
  | 'city'
  | 'postalCode'
  | 'state'
  | 'country';

export class AddressValuesObjectFactory {
  static objects: Record<AddressValuesObjectKey, ValueObject> = {
    userId: new IDVO(IDConstants.EXEMPLE),
    number: new NumberVO(NumberConstants.EXEMPLE),
    street: new StreetVO(StreetConstants.EXEMPLE),
    complement: new ComplementVO(ComplementConstants.EXEMPLE),
    neighborhood: new NeighborhoodVO(NeighborhoodConstants.EXEMPLE),
    city: new CityVO(CityConstants.EXEMPLE),
    postalCode: new PostalCodeVO(PostalCodeConstants.EXEMPLE),
    state: new StateVO(StateConstants.EXEMPLE),
    country: new CountryVO(CountryConstants.EXEMPLE),
  };
  static getObjects(
    keys: AddressValuesObjectKey[],
  ): Partial<Record<AddressValuesObjectKey, ValueObject>> {
    const output: Partial<Record<AddressValuesObjectKey, ValueObject>> = {};

    keys.forEach((key) => {
      output[key] = this.objects[key];
    });

    return output;
  }
}
