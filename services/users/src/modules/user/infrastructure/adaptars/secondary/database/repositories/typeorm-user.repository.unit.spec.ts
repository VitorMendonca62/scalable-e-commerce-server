import { Repository } from 'typeorm';

vi.mock('../models/user.model', () => ({
  default: class UserModel {},
}));

import TypeOrmUserRepository from './typeorm-user.repository';
import UserModel from '../models/user.model';
import { UserFactory } from '@modules/user/infrastructure/helpers/users/factory';

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let usersRepository: Repository<UserModel>;

  beforeEach(() => {
    usersRepository = {
      save: vi.fn(),
      findOneBy: vi.fn(),
      findOne: vi.fn(),
      softDelete: vi.fn(),
      update: vi.fn(),
    } as any;

    repository = new TypeOrmUserRepository(usersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  describe('create', () => {
    const user = UserFactory.createModel();

    it('should call save with correct parameters', async () => {
      await repository.create(user);

      expect(usersRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('findOne', () => {
    const options = {
      userID: 'user-123',
      email: 'test@example.com',
    };

    const user = { ...UserFactory.createModel(), id: 1 };

    it('should call findOneBy with correct parameters', async () => {
      vi.spyOn(usersRepository, 'findOneBy').mockResolvedValue(user);

      await repository.findOne(options);

      expect(usersRepository.findOneBy).toHaveBeenCalledWith(options);
    });

    it('should return the user when found', async () => {
      vi.spyOn(usersRepository, 'findOneBy').mockResolvedValue(user);

      const result = await repository.findOne(options);

      expect(result).toEqual(user);
    });

    it('should return null when user is not found', async () => {
      vi.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

      const result = await repository.findOne(options);

      expect(result).toBeNull();
    });
  });

  describe('findOneWithOR', () => {
    const options = [{ userID: 'user-123' }, { email: 'test@example.com' }];
    const withDeleted = true;

    const user = { ...UserFactory.createModel(), id: 1 };

    it('should call findOne with correct parameters', async () => {
      vi.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      await repository.findOneWithOR(options, withDeleted);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: options,
        withDeleted,
      });
    });

    it('should return the user when found', async () => {
      vi.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      const result = await repository.findOneWithOR(options, withDeleted);

      expect(result).toEqual(user);
    });

    it('should return null when user is not found', async () => {
      vi.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.findOneWithOR(options, withDeleted);

      expect(result).toBeNull();
    });

    it('should work with withDeleted as false', async () => {
      vi.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      await repository.findOneWithOR(options, false);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: options,
        withDeleted: false,
      });
    });
  });

  describe('delete', () => {
    const userID = 'user-123';

    it('should call softDelete with correct parameters', async () => {
      vi.spyOn(usersRepository, 'softDelete').mockResolvedValue({
        affected: 1,
      } as any);

      await repository.delete(userID);

      expect(usersRepository.softDelete).toHaveBeenCalledWith({ userID });
    });

    it('should return the number of affected rows', async () => {
      vi.spyOn(usersRepository, 'softDelete').mockResolvedValue({
        affected: 1,
      } as any);

      const result = await repository.delete(userID);

      expect(result).toBe(1);
    });

    it('should return 0 when no rows are affected', async () => {
      vi.spyOn(usersRepository, 'softDelete').mockResolvedValue({
        affected: 0,
      } as any);

      const result = await repository.delete(userID);

      expect(result).toBe(0);
    });
  });

  describe('update', () => {
    const userID = 'user-123';
    const newFields: Partial<UserModel> = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should call update with correct parameters', async () => {
      vi.spyOn(usersRepository, 'update').mockResolvedValue({
        affected: 1,
      } as any);

      await repository.update(userID, newFields);

      expect(usersRepository.update).toHaveBeenCalledWith(
        { userID },
        newFields,
      );
    });

    it('should return the number of affected rows', async () => {
      vi.spyOn(usersRepository, 'update').mockResolvedValue({
        affected: 1,
      } as any);

      const result = await repository.update(userID, newFields);

      expect(result).toBe(1);
    });

    it('should return 0 when no rows are affected', async () => {
      vi.spyOn(usersRepository, 'update').mockResolvedValue({
        affected: 0,
      } as any);

      const result = await repository.update(userID, newFields);

      expect(result).toBe(0);
    });
  });
});
