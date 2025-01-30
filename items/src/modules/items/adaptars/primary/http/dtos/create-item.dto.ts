export abstract class CreateItemDTO {
  attributes: { [key: string]: string | number }[];
  title: string;
  description: string;
  technicalDetails: { [key: string]: string | number }[];
  amount: number;
  photos: string[];
  category: string;
  available: boolean;
}
