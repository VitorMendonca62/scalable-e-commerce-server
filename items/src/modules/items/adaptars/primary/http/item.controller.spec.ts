import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TestingModule, Test } from '@nestjs/testing';
import { MessagingService } from '../../secondary/messaging/messaging.service';
import { ItemController } from './item.controller';
import { ItemMapper } from '@modules/items/core/application/mappers/item.mapper';
import { CreateItemUseCase } from '@modules/items/core/application/use-cases/create-item.usecase';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import {
  mockItem,
  mockCreateItemDTO,
} from '@modules/items/helpers/tests.helper';

describe('ItemController', () => {
  let app: INestApplication;

  let controller: ItemController;

  let mapper: ItemMapper;

  let messagingService: MessagingService;

  let createItemUseCase: CreateItemUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.registerAsync([
          {
            name: 'MESSAGING_CLIENT',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
              const redisHost = configService.get<string>('MESSAGING_HOST');
              const redisUser = configService.get<string>('MESSAGING_USER');
              const redisPW = configService.get<string>('MESSAGING_PW');
              const redisPort = configService.get<number>('MESSAGING_PORT');

              return {
                transport: Transport.REDIS,
                options: {
                  host: redisHost,
                  port: redisPort,
                  username: redisUser,
                  password: redisPW,
                },
              };
            },
          },
        ]),
      ],
      controllers: [ItemController],
      providers: [
        ConfigService,
        MessagingService,
        ItemMapper,
        CreateItemUseCase,
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);

    mapper = module.get<ItemMapper>(ItemMapper);

    messagingService = module.get<MessagingService>(MessagingService);

    createItemUseCase = module.get<CreateItemUseCase>(CreateItemUseCase);

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(mapper).toBeDefined();
    expect(messagingService).toBeDefined();
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
      jest.spyOn(createItemUseCase, 'execute').mockImplementation(() => item);
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
      expect(createItemUseCase.execute).toHaveBeenNthCalledWith(item);
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
});
