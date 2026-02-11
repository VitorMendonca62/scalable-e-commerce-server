import UserRepository from '@modules/user/domain/ports/secondary/user-repository.port';
import { ExternalUser } from '@modules/user/domain/types/external-user';
import { UserMapper } from '@modules/user/infrastructure/mappers/user.mapper';
import UserExternalController from './user.external.controller';
import {
  UserDTOFactory,
  UserFactory,
} from '@modules/user/infrastructure/helpers/users/factory';

describe('UserExternalController', () => {
  let controller: UserExternalController;
  let userRepository: UserRepository;
  let userMapper: UserMapper;

  beforeEach(() => {
    userRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
    } as any;

    userMapper = {
      externalControllerPayloadForModel: vi.fn(),
    } as any;

    controller = new UserExternalController(userRepository, userMapper);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userMapper).toBeDefined();
  });

  describe('createUserGoogle', () => {
    const externalUserPayload: ExternalUser =
      UserDTOFactory.createGoogleExternalPayload();

    const mappedUser = UserFactory.createModel();

    beforeEach(() => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      vi.spyOn(userMapper, 'externalControllerPayloadForModel').mockReturnValue(
        mappedUser,
      );
      vi.spyOn(userRepository, 'create').mockResolvedValue(mappedUser);
    });

    it('should call userRepository.findOne with correct parameters', async () => {
      await controller.createUserGoogle(externalUserPayload);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userID: externalUserPayload.userID,
      });
    });

    it('should call userMapper.externalControllerPayloadForModel when user does not exist', async () => {
      await controller.createUserGoogle(externalUserPayload);

      expect(userMapper.externalControllerPayloadForModel).toHaveBeenCalledWith(
        externalUserPayload,
      );
    });

    it('should call userRepository.create when user does not exist', async () => {
      await controller.createUserGoogle(externalUserPayload);

      expect(userRepository.create).toHaveBeenCalledWith(mappedUser);
    });

    it('should not call userMapper and create when user already exists (not null)', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(mappedUser);

      await controller.createUserGoogle(externalUserPayload);

      expect(
        userMapper.externalControllerPayloadForModel,
      ).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should not call userMapper and create when user is not undefined', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(mappedUser);

      await controller.createUserGoogle(externalUserPayload);

      expect(
        userMapper.externalControllerPayloadForModel,
      ).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should return early when user exists without throwing error', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(mappedUser);

      const result = await controller.createUserGoogle(externalUserPayload);

      expect(result).toBeUndefined();
    });

    it('should rethrow error if userRepository.findOne throws error', async () => {
      vi.spyOn(userRepository, 'findOne').mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.createUserGoogle(externalUserPayload),
      ).rejects.toThrow('Database error');
    });

    it('should rethrow error if userMapper.externalControllerPayloadForModel throws error', async () => {
      vi.spyOn(
        userMapper,
        'externalControllerPayloadForModel',
      ).mockImplementation(() => {
        throw new Error('Mapping error');
      });

      await expect(
        controller.createUserGoogle(externalUserPayload),
      ).rejects.toThrow('Mapping error');
    });

    it('should rethrow error if userRepository.create throws error', async () => {
      vi.spyOn(userRepository, 'create').mockRejectedValue(
        new Error('Creation error'),
      );

      await expect(
        controller.createUserGoogle(externalUserPayload),
      ).rejects.toThrow('Creation error');
    });

    it('should successfully create user when all conditions are met', async () => {
      await controller.createUserGoogle(externalUserPayload);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(
        userMapper.externalControllerPayloadForModel,
      ).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
    });
  });
});
