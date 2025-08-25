import { CreateUserUseCase } from '@user/core/application/use-cases/create-user.usecase';

import { TestingModule, Test } from '@nestjs/testing';
import { UserMapper } from '@modules/user2/infrastructure/mappers/user.mapper';
import {
  mockCreatUserDTO as mockCreateUserDTO,
  mockUser,
} from '@modules/user2/infrastructure/helpers/tests.helper';
import { UserRepository } from '@modules/user/domain/ports/secondary/user-repository.port';
import { InMemoryUserRepository } from '../../secondary/database/repositories/inmemory-user.repository';

import UserExternalController from './user.external.controller';
import { MessagingService } from '../../secondary/messaging/messaging.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

describe('UserExternalController', () => {
  let controller: UserExternalController;

  let mapper: UserMapper;

  let createUserUseCase: CreateUserUseCase;

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
      controllers: [UserExternalController],
      providers: [
        ConfigService,
        UserMapper,
        CreateUserUseCase,
        MessagingService,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    controller = module.get<UserExternalController>(UserExternalController);

    mapper = module.get<UserMapper>(UserMapper);

    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(mapper).toBeDefined();
    expect(createUserUseCase).toBeDefined();
  });

  describe('create', () => {
    const user = mockUser();
    const dto = mockCreateUserDTO();

    beforeEach(() => {
      jest.spyOn(mapper, 'createDTOForEntity').mockImplementation(() => user);
      jest
        .spyOn(createUserUseCase, 'execute')
        .mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters', async () => {
      const dto = mockCreateUserDTO();
      await controller.create(dto);

      expect(mapper.createDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(user);
    });

    it('should create user ', async () => {
      const response = await createUserUseCase.execute(dto);

      expect(response).toBeUndefined();
    });
  });
});
