export class AddressEntity {
  id?: number;
  userId: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id?: number;
    userId: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    postalCode: string;
    state: string;
    country: string;
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
