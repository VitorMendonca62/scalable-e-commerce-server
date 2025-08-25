import CountryVO from '../values-objects/address/country/country-vo';

export class Address {
  id: number;
  user_id: string;
  street: string;
  number: number;
  complement: string | null;
  district: string;
  city: string;
  postalCode: string;
  state: string;
  country: CountryVO;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: number;
    user_id: string;
    street: string;
    number: number;
    complement: string | null;
    district: string;
    city: string;
    postalCode: string;
    state: string;
    country: CountryVO;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.user_id = props.user_id;
    this.street = props.street;
    this.number = props.number;
    this.complement = props.complement;
    this.district = props.district;
    this.city = props.city;
    this.postalCode = props.postalCode;
    this.state = props.state;
    this.country = props.country;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
