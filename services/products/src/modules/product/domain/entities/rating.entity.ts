export default class RatingEntity {
  productID: string;
  userID: string;
  value: number;
  comment?: string;
  images?: string[];

  constructor(props: {
    productID: string;
    userID: string;
    value: number;
    comment?: string;
    images?: string[];
  }) {
    this.productID = props.productID;
    this.userID = props.userID;
    this.value = props.value;
    this.comment = props.comment;
    this.images = props.images;
  }
}
