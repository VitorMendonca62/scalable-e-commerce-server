import { Item } from '@modules/items/core/domain/entities/item.entity';

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
  abstract findByCategory(category: string): Promise<Item[]>;
  abstract findByTitle(title: string): Promise<Item[]>;
  abstract findByAvailable(available: boolean): Promise<Item[]>;
  abstract multiFilters(filters: Record<string, any>): Promise<Item[]>;
}
