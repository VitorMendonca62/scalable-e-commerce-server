import CountryVO from '../values-objects/address/country/country-vo';
import StreetVO from '../values-objects/address/street/street-vo';
import NumberVO from '../values-objects/address/number/number-vo';
import IDVO from '../values-objects/uuid/id-vo';
import ComplementVO from '../values-objects/address/complement/complement-vo';
import NeighborhoodVO from '../values-objects/address/neighborhood/neighborhood-vo';
import CityVO from '../values-objects/address/city/city-vo';
import PostalCodeVO from '../values-objects/address/postal-code/postal-code-vo';
import StateVO from '../values-objects/address/state/state-vo';

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
