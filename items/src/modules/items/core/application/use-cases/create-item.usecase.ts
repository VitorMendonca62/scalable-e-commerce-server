import { Injectable } from '@nestjs/common';
import { Item } from '../../domain/entities/item.entity';
import { CreateItemPort } from '../ports/primary/item.port';
import { ItemRepository } from '../ports/secondary/item-repository.interface';

@Injectable()
export class CreateItemUseCase implements CreateItemPort {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute(item: Item): Promise<void> {
    await this.itemRepository.create(item);
  }
}
