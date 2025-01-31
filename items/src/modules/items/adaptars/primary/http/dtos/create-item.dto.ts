export abstract class CreateItemDTO {
  attributes: Record<string, string>;
  title: string;
  description: string;
  price: number;
  technicalDetails: Record<string, string>;
  amount: number;
  photos: string[];
  category: string;
  available: boolean;
}
