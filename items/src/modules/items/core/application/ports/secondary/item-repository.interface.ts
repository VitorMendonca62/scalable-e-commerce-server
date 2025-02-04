import { ItemUpdate } from '@modules/items/core/domain/entities/item-update.entity';
import { Item } from '@modules/items/core/domain/entities/item.entity';

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

export abstract class ItemRepository {
  abstract create(item: Item): Promise<void>;
  abstract getAll(): Promise<Item[]>;
  abstract findById(id: string): Promise<Item | undefined>;
  abstract filter(
    key: ItemKeys,
    value: ItemValues,
    signal: Signals,
    items: Item[] | undefined,
  ): Promise<Item[] | undefined>;
  abstract update(id: string, newItem: ItemUpdate): Promise<Item>;
  abstract delete(id: string): Promise<void>;
}
