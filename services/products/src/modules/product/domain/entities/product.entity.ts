import { PaymentTypes } from '../enums/payments-types.enum';

export default class ProductEntity {
  title: string;
  price: number;
  overview: string;
  description: string;
  photos: string[];
  payments: PaymentTypes[];
  active: boolean;
  stock: number;
  owner: string;

  constructor(props: {
    title: string;
    price: number;
    overview: string;
    description: string;
    photos: string[];
    payments: PaymentTypes[];
    active: boolean;
    stock: number;
    owner: string;
  }) {
    this.title = props.title;
    this.price = props.price;
    this.overview = props.overview;
    this.description = props.description;
    this.photos = props.photos;
    this.payments = props.payments;
    this.active = props.active;
    this.stock = props.stock;
    this.owner = props.owner;
  }
}
