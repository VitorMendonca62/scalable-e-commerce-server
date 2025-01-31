import { CreateItemDTO } from '@modules/items/adaptars/primary/http/dtos/create-item.dto';

export class Item {
  _id?: string;
  attributes: Record<string, string>;
  title: string;
  description: string;
  price: number;
  technicalDetails: Record<string, string>;
  amount: number;
  photos: string[];
  rating: number;
  raters: number;
  category: string;
  available: boolean;

  constructor(data: CreateItemDTO) {
    this.attributes = data.attributes;
    this.title = data.title;
    this.description = data.description;
    this.price = data.price;
    this.technicalDetails = data.technicalDetails;
    this.amount = data.amount;
    this.photos = data.photos;
    this.category = data.category;
    this.available = data.available;
    this.rating = 0;
    this.raters = 0;
  }
}
