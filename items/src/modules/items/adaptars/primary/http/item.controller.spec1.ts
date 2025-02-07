import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { TestingModule, Test } from '@nestjs/testing';
import { MessagingService } from '../../secondary/messaging/messaging.service';
import { ItemController } from './item.controller';
import { ItemMapper } from '@modules/items/core/application/mappers/item.mapper';
import { CreateItemUseCase } from '@modules/items/core/application/use-cases/create-item.usecase';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import {
  mockItem,
  mockCreateItemDTO,
  mockItemsList,
} from '@modules/items/helpers/tests.helper';
import { GetItemUseCase } from '@modules/items/core/application/use-cases/get-item.usecase';
import { GetItemsUseCase } from '@modules/items/core/application/use-cases/get-items.usecase';
import { messagingClientConfig } from 'src/config/messaging/redis.config';
import { Item } from '@modules/items/core/domain/entities/item.entity';
import { FilterItemUseCase } from '@modules/items/core/application/use-cases/filter-item.usecase';

describe('ItemController', () => {
  let app: INestApplication;

  let controller: ItemController;

  let mapper: ItemMapper;

  let messagingService: MessagingService;

  let createItemUseCase: CreateItemUseCase;
  let getItemUseCase: GetItemUseCase;
  let getItemsUseCase: GetItemsUseCase;
  let filterItemsUseCase: FilterItemUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.registerAsync([
          {
            name: 'MESSAGING_CLIENT',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: messagingClientConfig,
          },
        ]),
      ],
      controllers: [ItemController],
      providers: [
        ConfigService,
        MessagingService,
        ItemMapper,
        CreateItemUseCase,
        GetItemUseCase,
        GetItemsUseCase,
        FilterItemUseCase,
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);

    mapper = module.get<ItemMapper>(ItemMapper);

    messagingService = module.get<MessagingService>(MessagingService);

    createItemUseCase = module.get<CreateItemUseCase>(CreateItemUseCase);
    getItemUseCase = module.get<GetItemUseCase>(GetItemUseCase);
    getItemsUseCase = module.get<GetItemsUseCase>(GetItemsUseCase);
    filterItemsUseCase = module.get<FilterItemUseCase>(FilterItemUseCase);

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(controller).toBeDefined();
    expect(mapper).toBeDefined();
    expect(messagingService).toBeDefined();
    expect(createItemUseCase).toBeDefined();
    expect(getItemUseCase).toBeDefined();
    expect(getItemsUseCase).toBeDefined();
  });

  describe('create', () => {
    const item = mockItem();
    const itemId = 'ITEMID';
    const dto = mockCreateItemDTO();

    beforeEach(() => {
      jest
        .spyOn(messagingService, 'publish')
        .mockImplementation(() => undefined);
      jest
        .spyOn(mapper, 'createItemDTOForEntity')
        .mockImplementation(() => item);
      jest
        .spyOn(createItemUseCase, 'execute')
        .mockImplementation(async () => undefined);
    });

    it('should call mapper, messaging service and usecase with correct parameters', async () => {
      await controller.create(dto);

      expect(mapper.createItemDTOForEntity).toHaveBeenCalledWith(dto);
      const { title, amount, photos, category, available } = dto;
      const { rating, raters } = item;
      expect(messagingService.publish).toHaveBeenCalledWith({
        _id: itemId,
        title,
        amount,
        photos,
        category,
        available,
        rating,
        raters,
      });
      expect(createItemUseCase.execute).toHaveBeenCalledWith(item);
    });

    it('should create item and return sucess message', async () => {
      const response = await request(app.getHttpServer())
        .post('/items/create')
        .send(dto)
        .expect(201);

      const body = response.body;
      expect(body).toEqual({
        message: 'Item adicionado a venda',
        data: undefined,
      });
    });

    it('should return bad request exception when no have fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/items/create')
        .send({})
        .expect(400);

      const body = response.body;
      expect(body).toEqual({
        error: 'Bad Request',
        message: [
          'É necessário fornecer ao menos um atributo',
          'O titulo é obrigatório',
          'A descrição é obrigatória',
          'É necessário fornecer no mínimo cinco detalhes técnicos',
          'A quantidade de itens é obrigatória',
          'É necessário fornecer no mínimo duas fotos do item',
          'A categoria é obrigatória',
          'É necessário informar se o produto está disponível',
        ],
        statusCode: 400,
      });
    });

    it('should return bad request exception with invalid fields', async () => {
      const dto = mockCreateItemDTO({
        title: 'TET',
        description: 'SEILA',
        photos: ['sla', 'sla'],
      });

      const response = await request(app.getHttpServer())
        .post('/items/create')
        .send(dto)
        .expect(400);

      const body = response.body;
      expect(body).toEqual({
        error: 'Bad Request',
        message: [
          'O titulo está curto demais. Minímo de 4 caracters',
          'A descrição está curta demais. Minímo de 10 caracters',
          'As fotos não estão na codificação Base64',
        ],
        statusCode: 400,
      });
    });
  });

  describe('getOne', () => {
    const id = 'ITEMID';
    const item = mockItem({ _id: id });

    beforeEach(() => {
      jest
        .spyOn(getItemUseCase, 'findById')
        .mockImplementation(async () => item);
    });

    it('should call usecase with correct parameters and return a item', async () => {
      const response = await request(app.getHttpServer())
        .get(`/item/${id}`)
        .expect(200);
      const body = await response.body;

      expect(getItemUseCase.findById).toHaveBeenCalledWith(id);
      expect(body).toEqual({
        message: 'Aqui está o livro filtrado por ID',
        data: item,
      });
      expect(body.data).toBeInstanceOf(Item);
    });
  });

  describe('getAll', () => {
    const items = mockItemsList();

    beforeEach(() => {
      jest
        .spyOn(getItemsUseCase, 'getAll')
        .mockImplementation(async () => items);
    });

    it('should call usecase with correct parameters and return all items', async () => {
      const response = await request(app.getHttpServer())
        .get(`/item/items`)
        .expect(200);

      const body = await response.body;

      expect(getItemsUseCase.getAll).toHaveBeenCalled();
      expect(body).toEqual({
        message: 'Aqui está a listagem de todos os livros',
        data: items,
      });
      expect(body.data[0]).toBeInstanceOf(Item);
    });
  });

  describe('filter', () => {
    const items = mockItemsList();
    const title = 'item';
    const category = 'books';
    const available = true;

    beforeEach(() => {
      jest
        .spyOn(filterItemsUseCase, 'findByTitle')
        .mockImplementation(async () => items);
    });

    it('should throw not found exception when no have fields', async () => {
      await expect(controller.filter({})).rejects.toThrow(
        new NotFoundException('Não foi possivel encontrar os itens'),
      );
    });

    describe('multiFields', async () => {
      it('should call usecase with correct parameters and return all filtered items by title', async () => {
        const response = await controller.filter({
          title,
          category,
          available,
          teste: 'teste',
        });

        expect(filterItemsUseCase.multiFilters).toHaveBeenCalledWith({
          title,
          category,
          available,
        });
        expect(response).toEqual({
          message:
            'Aqui está a listagem de todos os livros filtrados por multiplos filtros',
          data: items,
        });
        expect(response.data[0]).toBeInstanceOf(Item);
      });
    });

    describe('filterByTitle', () => {
      it('should call usecase with correct parameters and return all filtered items by title', async () => {
        const response = await controller.filter({ title });

        expect(filterItemsUseCase.findByTitle).toHaveBeenCalledWith();
        expect(response).toEqual({
          message:
            'Aqui está a listagem de todos os livros filtrados pelo titulo',
          data: items,
        });
        expect(response.data[0]).toBeInstanceOf(Item);
      });
    });

    describe('filterByCategory', () => {
      it('should call usecase with correct parameters and return all filtered items by category', async () => {
        const response = await controller.filter({ category });

        expect(filterItemsUseCase.findByCategory).toHaveBeenCalledWith();
        expect(response).toEqual({
          message:
            'Aqui está a listagem de todos os livros filtrados pela categoria',
          data: items,
        });
        expect(response.data[0]).toBeInstanceOf(Item);
      });
    });

    describe('filterByAvailable', () => {
      it('should call usecase with correct parameters and return all filtered items by available', async () => {
        const response = await controller.filter({ available });

        expect(filterItemsUseCase.findByAvailable).toHaveBeenCalledWith();
        expect(response).toEqual({
          message:
            'Aqui está a listagem de todos os livros filtrados por disponível',
          data: items,
        });
        expect(response.data[0]).toBeInstanceOf(Item);
      });
    });
  });
});
