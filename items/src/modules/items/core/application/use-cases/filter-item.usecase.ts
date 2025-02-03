import { Item } from '../../domain/entities/item.entity';
import { FilterItemsPort } from '../ports/primary/item.port';

export class FilterItemUseCase implements FilterItemsPort {
  findByAvailable(available: boolean): Promise<Item[]> {
    throw new Error('Method not implemented.');
  }
  findByCategory(category: string): Promise<Item[]> {
    throw new Error('Method not implemented.');
  }
  findByTitle(title: string): Promise<Item[]> {
    throw new Error('Method not implemented.');
  }
  multiFilters(filters: Record<string, any>): Promise<Item[]> {
    throw new Error('Method not implemented.');
  }
}
