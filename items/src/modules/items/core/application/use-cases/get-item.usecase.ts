import { Item } from '../../domain/entities/item.entity';
import { GetItemPort } from '../ports/primary/item.port';

export class GetItemUseCase implements GetItemPort {
  findById(id: string): Promise<Item> {
    throw new Error('Method not implemented.');
  }
}
