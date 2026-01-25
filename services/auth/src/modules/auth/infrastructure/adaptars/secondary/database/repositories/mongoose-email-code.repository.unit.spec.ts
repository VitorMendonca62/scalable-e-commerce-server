import MongooseEmailCodeRepository from './mongoose-email-code.repository';
import { EmailConstants } from '@auth/domain/values-objects/constants';
import { EmailCodeDocument } from '../models/email-code.model';
import { Model } from 'mongoose';
import { type Mock } from 'vitest';
import { EmailCodeModelFactory } from '@auth/infrastructure/helpers/tests/email-code-factory';

describe('MongooseEmailCodeRepository', () => {
  let repository: MongooseEmailCodeRepository;

  let EmailCodeModel: Model<EmailCodeDocument>;

  let mockedExecFindOne: Mock;
  let mockedSavePrototype: Mock;
  let mockedExecDelete: Mock;

  beforeEach(async () => {
    EmailCodeModel = vi.fn() as any;

    repository = new MongooseEmailCodeRepository(EmailCodeModel);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(EmailCodeModel).toBeDefined();
  });

  describe('findOne', () => {
    let emailCodeModelFactory: EmailCodeModelFactory;

    beforeEach(() => {
      emailCodeModelFactory = new EmailCodeModelFactory();

      mockedExecFindOne = vi
        .fn()
        .mockReturnValue(emailCodeModelFactory.likeOBject());
      EmailCodeModel.findOne = vi.fn().mockReturnValue({
        exec: mockedExecFindOne,
      });
    });

    it('should return user with one field', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
      });

      expect(EmailCodeModel.findOne).toHaveBeenCalledWith({
        email: EmailConstants.EXEMPLE,
      });
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(emailCodeModelFactory.likeOBject());
      expect(response.email).toBe(EmailConstants.EXEMPLE);
    });

    it('should return user with many fields', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
        code: 'AAAAAA',
      });

      expect(EmailCodeModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(emailCodeModelFactory.likeOBject());
      expect(response.email).toBe(EmailConstants.EXEMPLE);
      expect(response.code).toBe('AAAAAA');
    });

    it('should return undefined when not found user', async () => {
      mockedExecFindOne.mockReturnValue(undefined);

      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
      });

      expect(response).toBeUndefined();
    });
  });

  describe('save', () => {
    let emailCodeModelFactory = new EmailCodeModelFactory();
    const emailCode = emailCodeModelFactory.likeOBject();

    beforeEach(() => {
      mockedSavePrototype = vi.fn().mockReturnValue(undefined);
      EmailCodeModel.prototype.save = mockedSavePrototype;
    });

    it('should save user', async () => {
      const response = await repository.save(emailCode);

      expect(response).toBeUndefined();
      expect(EmailCodeModel).toHaveBeenCalledWith(emailCode);
      expect(mockedSavePrototype).toHaveBeenCalled();
    });
  });

  describe('deleteMany', () => {
    beforeEach(() => {
      mockedExecDelete = vi.fn();
      EmailCodeModel.deleteMany = vi.fn().mockReturnValue({
        exec: mockedExecDelete,
      });
    });

    it('should call all functions with correct parameters and delete', async () => {
      await repository.deleteMany(EmailConstants.EXEMPLE);

      expect(EmailCodeModel.deleteMany).toHaveBeenCalledWith({
        email: EmailConstants.EXEMPLE,
      });
      expect(mockedExecDelete).toHaveBeenCalled();
    });
  });
});
