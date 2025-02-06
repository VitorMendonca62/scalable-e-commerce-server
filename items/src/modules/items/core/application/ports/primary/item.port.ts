import { Item } from '@modules/items/core/domain/entities/item.entity';
import {
  ItemKeys,
  ItemValues,
  Signals,
} from '@modules/items/core/domain/types/item.types';

export abstract class CreateItemPort {
  abstract execute(item: Item): Promise<void>;
}

export abstract class GetItemPort {
  abstract findById(id: string): Promise<Item>;
}

export abstract class GetItemsPort {
  abstract getAll(): Promise<Item[]>;
}

export abstract class FilterItemsPort {
  abstract execute(
    keys: ItemKeys[],
    values: ItemValues[],
    signals: Signals[],
  ): Promise<Item[]>;
}
