export type ItemKeys =
  | 'title'
  | 'description'
  | 'price'
  | 'amount'
  | 'rating'
  | 'raters'
  | 'category'
  | 'available';

export type ItemValues = string | number | boolean;

export type Signals = '>' | '<' | '=';
