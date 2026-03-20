export default class CategoryEntity {
  publicID: string;
  name: string;
  active: boolean;

  constructor(props: { publicID: string; name: string; active: boolean }) {
    this.publicID = props.publicID;
    this.name = props.name;
    this.active = props.active;
  }
}
