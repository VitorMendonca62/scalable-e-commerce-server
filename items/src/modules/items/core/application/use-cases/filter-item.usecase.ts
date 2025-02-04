import { NotFoundException } from '@nestjs/common';
import { Item } from '../../domain/entities/item.entity';
import { ItemKeys, ItemValues, Signals } from '../../domain/types/item.types';
import { FilterItemsPort } from '../ports/primary/item.port';
import { ItemRepository } from '../ports/secondary/item-repository.interface';

export class FilterItemUseCase implements FilterItemsPort {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute(
    keys: ItemKeys[],
    values: ItemValues[],
    signals: Signals[],
  ): Promise<Item[]> {
    let items: Item[] | undefined;

    for (let index = 0; index < keys.length; index++) {
      items = await this.itemRepository.filter(
        keys[index],
        values[index],
        signals[index],
        items,
      );
    }

    if (items == undefined) {
      throw new NotFoundException(
        'Não foi possivel encontrar itens com esses filtros',
      );
    }

    return items;
  }
}
