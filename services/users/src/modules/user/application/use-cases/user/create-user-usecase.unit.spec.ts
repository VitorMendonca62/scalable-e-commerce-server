import UserRepository from '@user/domain/ports/secondary/user-repository.port';

import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { CreateUserUseCase } from './create-user.usecase';
import { UserFactory } from '@modules/user/infrastructure/helpers/users/factory';
import {
  EmailConstants,
  UsernameConstants,
} from '@modules/user/domain/values-objects/user/constants';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';
import { PasswordHasher } from '@modules/user/domain/ports/secondary/password-hasher.port';
import { PasswordConstants } from '@modules/user/domain/constants/password-constants';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: UserRepository;
  let userMapper: UserMapper;
  let passwordHashser: PasswordHasher;

  beforeEach(async () => {
    userRepository = {
      findOneWithOR: vi.fn(),
      create: vi.fn(),
    } as any;

    userMapper = {
      entityToModel: vi.fn(),
    } as any;

    passwordHashser = {
      hash: vi.fn().mockReturnValue('hashedPassword'),
    } as any;

    useCase = new CreateUserUseCase(
      userRepository,
      userMapper,
      passwordHashser,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userMapper).toBeDefined();
  });

  describe('execute', () => {
    const user = UserFactory.createModel();
    const userEntity = UserFactory.createEntity();
    const password = PasswordConstants.EXEMPLE;

    beforeEach(() => {
      vi.spyOn(userRepository, 'findOneWithOR').mockResolvedValue(undefined);
      vi.spyOn(userMapper, 'entityToModel').mockReturnValue(user);
    });

    it('should call userRepository.findOneWithOR with correct parameters', async () => {
      await useCase.execute(userEntity, password);
      expect(userRepository.findOneWithOR).toHaveBeenCalledWith(
        [
          {
            username: userEntity.username.getValue(),
          },
          {
            email: userEntity.email.getValue(),
          },
        ],
        true,
      );
    });

    it('should call userMapper.entityToModel with correct parameters', async () => {
      await useCase.execute(userEntity, password);
      expect(userMapper.entityToModel).toHaveBeenCalledWith(userEntity);
    });

    it('should call userRepository.create with correct parameters', async () => {
      await useCase.execute(userEntity, password);
      expect(userRepository.create).toHaveBeenCalledWith(user);
    });

    it('should return ok and role,createdAt and updatedAT and hashed passoword on sucess', async () => {
      const result = await useCase.execute(userEntity, password);
      expect(result).toEqual({
        ok: true,
        result: {
          roles: user.roles,
          password: 'hashedPassword',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    });

    it('should return FIELD_ALREADY_EXISTS with email if email is already use', async () => {
      vi.spyOn(userRepository, 'findOneWithOR').mockResolvedValue(user);

      const result = await useCase.execute(userEntity, password);
      expect(result).toEqual({
        ok: false,
        message: EmailConstants.ERROR_ALREADY_EXISTS,
        result: 'email',
        reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS,
      });
    });

    it('should return FIELD_ALREADY_EXISTS with username if username is already use', async () => {
      vi.spyOn(userRepository, 'findOneWithOR').mockResolvedValue(
        UserFactory.createModel({ email: `no-use.${EmailConstants.EXEMPLE}` }),
      );

      const result = await useCase.execute(userEntity, password);
      expect(result).toEqual({
        ok: false,
        message: UsernameConstants.ERROR_ALREADY_EXISTS,
        result: 'username',
        reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS,
      });
    });

    it('should rethrow error if userRepository.findOneWithOr throw error', async () => {
      vi.spyOn(userRepository, 'findOneWithOR').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await useCase.execute(userEntity, password);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if userMapper.entityToModel throw error', async () => {
      vi.spyOn(userMapper, 'entityToModel').mockImplementation(() => {
        throw new Error('Error');
      });

      try {
        await useCase.execute(userEntity, password);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if userRepository.create throw error', async () => {
      vi.spyOn(userRepository, 'create').mockRejectedValue(new Error('Error'));

      try {
        await useCase.execute(userEntity, password);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
