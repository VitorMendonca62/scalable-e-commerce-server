import { InMemoryItemRepository } from '@modules/items/adaptars/secondary/database/repositories/inmemory-item.repository';
import { ItemRepository } from '../ports/secondary/item-repository.interface';
import { TestingModule, Test } from '@nestjs/testing';
import { mockItem } from '@modules/items/helpers/tests.helper';
import { FilterItemUseCase } from './filter-item.usecase';
import { ItemKeys, ItemValues, Signals } from '../../domain/types/item.types';
import { NotFoundException } from '@nestjs/common';

describe('FilterItemUseCase', () => {
  let useCase: FilterItemUseCase;

  let itemRepository: ItemRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilterItemUseCase,
        {
          provide: ItemRepository,
          useClass: InMemoryItemRepository,
        },
      ],
    }).compile();

    useCase = module.get<FilterItemUseCase>(FilterItemUseCase);
    itemRepository = module.get<ItemRepository>(ItemRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(itemRepository).toBeDefined();
  });

  describe('execute', () => {
    const keys: ItemKeys[] = ['category', 'rating', 'price'];
    const values: ItemValues[] = ['garden', 3, 50];
    const signals: Signals[] = ['=', '>', '<'];

    const filteredItems = [
      mockItem({
        title: 'item 01',
        _id: '1',
        category: 'garden',
        price: 23,
        rating: 4,
      }),
      mockItem({
        title: 'item 02',
        _id: '2',
        category: 'garden',
        price: 23,
        rating: 4,
      }),
    ];

    beforeEach(() => {
      jest
        .spyOn(itemRepository, 'filter')
        .mockImplementation(async () => filteredItems);
    });

    it('should call repository with correct parameters and return filtered items', async () => {
      const response = await useCase.execute(keys, values, signals);

      expect(Array.isArray(response)).toBe(true);

      expect(response).toEqual(filteredItems);

      expect(itemRepository.filter).toHaveBeenNthCalledWith(
        1,
        keys[0],
        values[0],
        signals[0],
      );
      expect(itemRepository.filter).toHaveBeenNthCalledWith(
        2,
        keys[1],
        values[1],
        signals[1],
      );
      expect(itemRepository.filter).toHaveBeenNthCalledWith(
        3,
        keys[2],
        values[2],
        signals[2],
      );
    });

    it('should throw not found exception when no have items', async () => {
      jest.spyOn(itemRepository, 'filter').mockImplementation(async () => []);

      await expect(useCase.execute(keys, values, signals)).rejects.toThrow(
        new NotFoundException(
          'Não foi possivel encontrar itens com esses filtros',
        ),
      );
    });
  });
});
