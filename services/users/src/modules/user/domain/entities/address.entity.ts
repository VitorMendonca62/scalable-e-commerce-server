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
import IDVO from '../values-objects/uuid/id-vo';

export class Address {
  id?: number;
  userId: IDVO;
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
    id?: number;
    userId: IDVO;
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
    this.id = props.id;
    this.userId = props.userId;
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
