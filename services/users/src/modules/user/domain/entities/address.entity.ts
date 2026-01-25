import {
  CityVO,
  ComplementVO,
  CountryVO,
  NeighborhoodVO,
  NumberVO,
  PostalCodeVO,
  StateVO,
  StreetVO,
} from '../values-objects/address/values-object';
import IDVO from '../values-objects/common/uuid/id-vo';

export class AddressEntity {
  userID: IDVO;
  street: StreetVO;
  number: NumberVO;
  complement: ComplementVO;
  neighborhood: NeighborhoodVO;
  city: CityVO;
  postalCode: PostalCodeVO;
  state: StateVO;
  country: CountryVO;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    userID: IDVO;
    street: StreetVO;
    number: NumberVO;
    complement: ComplementVO;
    neighborhood: NeighborhoodVO;
    city: CityVO;
    postalCode: PostalCodeVO;
    state: StateVO;
    country: CountryVO;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.userID = props.userID;
    this.street = props.street;
    this.number = props.number;
    this.complement = props.complement;
    this.neighborhood = props.neighborhood;
    this.city = props.city;
    this.postalCode = props.postalCode;
    this.state = props.state;
    this.country = props.country;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
