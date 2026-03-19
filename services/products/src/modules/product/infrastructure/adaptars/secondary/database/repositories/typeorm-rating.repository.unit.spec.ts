import { IDConstants } from '@product/domain/values-objects/constants';
import { Repository } from 'typeorm';
import ProductRatingModel from '../models/rating.model';
import TypeOrmRatingRepository from './typeorm-rating.repository';

describe('TypeOrmRatingRepository', () => {
  let repository: TypeOrmRatingRepository;
  let ratingRepository: Repository<ProductRatingModel>;

  beforeEach(() => {
    ratingRepository = {
      create: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      exists: vi.fn(),
    } as any;

    repository = new TypeOrmRatingRepository(ratingRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(ratingRepository).toBeDefined();
  });

  describe('create', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = 'user-123';
    const value = 4;
    const mockRating = {
      productID,
      userID,
      value,
    } as ProductRatingModel;

    beforeEach(() => {
      vi.spyOn(ratingRepository, 'create').mockReturnValue(mockRating);
      vi.spyOn(ratingRepository, 'save').mockResolvedValue(mockRating);
    });

    it('should call create with correct parameters', async () => {
      await repository.create(productID, userID, value);

      expect(ratingRepository.create).toHaveBeenCalledWith({
        productID,
        userID,
        value,
      });
    });

    it('should call save with created rating', async () => {
      await repository.create(productID, userID, value);

      expect(ratingRepository.save).toHaveBeenCalledWith(mockRating);
    });

    it('should save rating successfully', async () => {
      await repository.create(productID, userID, value);

      expect(ratingRepository.create).toHaveBeenCalledTimes(1);
      expect(ratingRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return void', async () => {
      const result = await repository.create(productID, userID, value);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = 'user-456';
    const updates = { value: 3 } as Partial<ProductRatingModel>;

    beforeEach(() => {
      vi.spyOn(ratingRepository, 'update').mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
    });

    it('should call update with correct parameters', async () => {
      await repository.update(productID, userID, updates);

      expect(ratingRepository.update).toHaveBeenCalledWith(
        { productID, userID },
        updates,
      );
    });

    it('should return true when affected is at least 1', async () => {
      const result = await repository.update(productID, userID, updates);

      expect(result).toBe(true);
    });

    it('should return true when affected is greater than 1', async () => {
      vi.spyOn(ratingRepository, 'update').mockResolvedValue({
        affected: 2,
        raw: {},
        generatedMaps: [],
      });

      const result = await repository.update(productID, userID, updates);

      expect(result).toBe(true);
    });

    it('should return false when affected is 0', async () => {
      vi.spyOn(ratingRepository, 'update').mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      });

      const result = await repository.update(productID, userID, updates);

      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = 'user-789';

    it('should call exists with correct parameters', async () => {
      vi.spyOn(ratingRepository, 'exists').mockResolvedValue(true);

      await repository.exists(productID, userID);

      expect(ratingRepository.exists).toHaveBeenCalledWith({
        where: { productID, userID },
      });
    });

    it('should return true when rating exists', async () => {
      vi.spyOn(ratingRepository, 'exists').mockResolvedValue(true);

      const result = await repository.exists(productID, userID);

      expect(result).toBe(true);
    });

    it('should return false when rating does not exist', async () => {
      vi.spyOn(ratingRepository, 'exists').mockResolvedValue(false);

      const result = await repository.exists(productID, userID);

      expect(result).toBe(false);
    });
  });
});
