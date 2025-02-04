import { UpdateItemDTO } from '@modules/items/adaptars/primary/http/dtos/update-item.dto';

export class ItemUpdate {
  attributes?: Record<string, string>;
  title?: string;
  description?: string;
  price?: number;
  technicalDetails?: Record<string, string>;
  amount?: number;
  photos?: string[];
  category?: string;
  available?: boolean;

  constructor(data: UpdateItemDTO) {
    if (data.attributes) this.attributes = data.attributes;
    if (data.title) this.title = data.title;
    if (data.description) this.description = data.description;
    if (data.price) this.price = data.price;
    if (data.technicalDetails) this.technicalDetails = data.technicalDetails;
    if (data.amount) this.amount = data.amount;
    if (data.photos) this.photos = data.photos;
    if (data.category) this.category = data.category;
    if (data.available) this.available = data.available;
  }
}
