import { Item } from '../../domain/entities/item.entity';
import { GetItemsPort } from '../ports/primary/item.port';

export class GetItemsUseCase implements GetItemsPort {
  getAll(): Promise<Item[]> {
    throw new Error('Method not implemented.');
  }
  findByCategory(): Promise<Item[]> {
    throw new Error('Method not implemented.');
  }
  findByTitle(): Promise<Item[]> {
    throw new Error('Method not implemented.');
  }
}
