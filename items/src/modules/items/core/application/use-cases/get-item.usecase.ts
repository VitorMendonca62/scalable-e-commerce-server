import { Injectable, NotFoundException } from '@nestjs/common';
import { Item } from '../../domain/entities/item.entity';
import { GetItemPort } from '../ports/primary/item.port';
import { ItemRepository } from '../ports/secondary/item-repository.interface';

@Injectable()
export class GetItemUseCase implements GetItemPort {
  constructor(private readonly itemRepository: ItemRepository) {}

  async findById(id: string): Promise<Item> {
    const item = await this.itemRepository.findById(id);

    if (!item) {
      throw new NotFoundException('Não foi possivel encontrar o item');
    }

    return item;
  }
}
