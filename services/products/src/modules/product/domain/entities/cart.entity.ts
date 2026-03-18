import { CartItem } from '../types/cart';

export default class CartEntity {
  publicID: string;
  userID: string;
  items: CartItem[];

  constructor(props: { publicID: string; userID: string; items: CartItem[] }) {
    this.publicID = props.publicID;
    this.userID = props.userID;
    this.items = props.items;
  }
}
