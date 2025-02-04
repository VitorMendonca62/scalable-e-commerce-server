import { InMemoryItemRepository } from '@modules/items/adaptars/secondary/database/repositories/inmemory-item.repository';
import { ItemRepository } from '../ports/secondary/item-repository.interface';
import { CreateItemUseCase } from './create-item.usecase';
import { TestingModule, Test } from '@nestjs/testing';
import { mockItem } from '@modules/items/helpers/tests.helper';

describe('CreateItemUseCase', () => {
  let useCase: CreateItemUseCase;

  let itemRepository: ItemRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateItemUseCase,
        {
          provide: ItemRepository,
          useClass: InMemoryItemRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateItemUseCase>(CreateItemUseCase);
    itemRepository = module.get<ItemRepository>(ItemRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(itemRepository).toBeDefined();
  });

  describe('execute', () => {
    const item = mockItem({ _id: 'ITEMID' });

    beforeEach(() => {
      jest.spyOn(itemRepository, 'create').mockImplementation(() => undefined);
    });

    it('should call repository with correct parameters and create item', async () => {
      const response = await useCase.execute(item);

      expect(response).toBeUndefined();

      expect(itemRepository.create).toHaveBeenCalledWith(item);
    });
  });
});
