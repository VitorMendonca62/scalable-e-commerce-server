import { ItemUpdate } from '@modules/items/core/domain/entities/item-update.entity';
import { Item } from '@modules/items/core/domain/entities/item.entity';
import {
  ItemKeys,
  ItemValues,
  Signals,
} from '@modules/items/core/domain/types/item.types';

export abstract class ItemRepository {
  abstract create(item: Item): Promise<void>;
  abstract getAll(): Promise<Item[]>;
  abstract findById(id: string): Promise<Item | undefined>;
  abstract filter(
    key: ItemKeys,
    value: ItemValues,
    signal: Signals,
    items: Item[] | undefined,
  ): Promise<Item[]>;
  abstract update(id: string, newItem: ItemUpdate): Promise<Item>;
  abstract delete(id: string): Promise<void>;
}
