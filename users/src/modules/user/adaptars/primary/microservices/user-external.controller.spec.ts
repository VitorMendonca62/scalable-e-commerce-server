import { CreateUserUseCase } from '@user/core/application/use-cases/create-user.usecase';

import { TestingModule, Test } from '@nestjs/testing';
import { UserMapper } from '@modules/user/core/application/mappers/user.mapper';
import {
  mockCreatUserDTO as mockCreateUserDTO,
  mockUser,
} from '@user/helpers/tests.helper';
import { UserRepository } from '@modules/user/core/application/ports/secondary/user-repository.interface';
import { InMemoryUserRepository } from '../../secondary/database/repositories/inmemory-user.repository';

import { MessagingModule } from '@modules/messaging/messaging.module';
import UserExternalController from './user.external.controller';

describe('UserExternalController', () => {
  let controller: UserExternalController;

  let mapper: UserMapper;

  let createUserUseCase: CreateUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MessagingModule],
      controllers: [UserExternalController],
      providers: [
        UserMapper,
        CreateUserUseCase,
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
