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
  categoryID: string;
  owner: string;
  publicID: string;

  constructor(props: {
    publicID: string;
    title: string;
    price: number;
    overview: string;
    description: string;
    photos: string[];
    payments: PaymentTypes[];
    active: boolean;
    stock: number;
    owner: string;
    categoryID: string;
  }) {
    this.publicID = props.publicID;
    this.title = props.title;
    this.price = props.price;
    this.overview = props.overview;
    this.description = props.description;
    this.photos = props.photos;
    this.payments = props.payments;
    this.active = props.active;
    this.stock = props.stock;
    this.owner = props.owner;
    this.categoryID = props.categoryID;
  }
}
