import { InMemoryItemRepository } from '@modules/items/adaptars/secondary/database/repositories/inmemory-item.repository';
import { ItemRepository } from '../ports/secondary/item-repository.interface';
import { TestingModule, Test } from '@nestjs/testing';
import { mockItem } from '@modules/items/helpers/tests.helper';
import { GetItemUseCase } from './get-item.usecase';
import { response } from 'express';
import { NotFoundException } from '@nestjs/common';

describe('GetItemUseCase', () => {
  let useCase: GetItemUseCase;

  let itemRepository: ItemRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetItemUseCase,
        {
          provide: ItemRepository,
          useClass: InMemoryItemRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetItemUseCase>(GetItemUseCase);
    itemRepository = module.get<ItemRepository>(ItemRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(itemRepository).toBeDefined();
  });

  describe('findById', () => {
    const id = 'ITEMID';
    const item = mockItem({ _id: id });

    beforeEach(() => {
      jest
        .spyOn(itemRepository, 'findById')
        .mockImplementation(async () => item);
    });

    it('should call repository with correct parameters and return item', async () => {
      const response = await useCase.findById(id);

      expect(response).toEqual(item);

      expect(itemRepository.findById).toHaveBeenCalledWith(id);
    });

    it('should throw not found error when no have item with id ', async () => {
      jest
        .spyOn(itemRepository, 'findById')
        .mockImplementation(async () => undefined);

      await expect(response).rejects.toThrow(
        new NotFoundException('Não foi possivel encontrar o item'),
      );
    });
  });
});
