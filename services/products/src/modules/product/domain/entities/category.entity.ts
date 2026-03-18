export default class CategoryEntity {
  publicID: string;
  name: string;
  slug: string;
  active: boolean;

  constructor(props: {
    publicID: string;
    name: string;
    slug: string;
    active: boolean;
  }) {
    this.publicID = props.publicID;
    this.name = props.name;
    this.slug = props.slug;
    this.active = props.active;
  }
}
