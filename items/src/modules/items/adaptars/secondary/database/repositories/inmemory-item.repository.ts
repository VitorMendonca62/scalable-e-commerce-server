import {
  ItemKeys,
  ItemRepository,
  ItemValues,
  Signals,
} from '@modules/items/core/application/ports/secondary/item-repository.interface';
import { ItemUpdate } from '@modules/items/core/domain/entities/item-update.entity';
import { Item } from '@modules/items/core/domain/entities/item.entity';
import { mockItem } from '@modules/items/helpers/tests.helper';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Injectable()
export class InMemoryItemRepository implements ItemRepository {
  items: Item[] = [mockItem({ _id: 'ITEM' })];

  async create(item: Item): Promise<void> {
    item._id = randomUUID();

    this.items.push(item);
  }

  async getAll(): Promise<Item[]> {
    return this.items;
  }

  async findById(id: string): Promise<Item | undefined> {
    return this.items.find((item) => item._id === id);
  }

  async filter(
    key: ItemKeys,
    value: ItemValues,
    signal: Signals,
    items: Item[] | undefined,
  ): Promise<Item[] | undefined> {
    const array = items ? items : this.items;

    return array.filter((item) => eval(`${value}${signal}${item[key]}`));
  }

  async update(id: string, newItem: ItemUpdate): Promise<Item> {
    const oldItem: Item = this.items.find((task) => task._id == id);
    const oldItemIndex = this.items.indexOf(oldItem);

    this.items[oldItemIndex] = { ...this.items[oldItemIndex], ...newItem };
    return this.items[oldItemIndex];
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item._id === id);

    this.items.splice(index, 1);

    delete this.items[index];
  }
}
