import { mockEmailCodeLikeJSONWithoutValidCode as mockEmailCodeLikeJSON } from '@auth/infrastructure/helpers/tests/email-code-helper';
import MongooseEmailCodeRepository from './mongoose-email-code.repository';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';

describe('MongooseEmailCodeRepository', () => {
  let repository: MongooseEmailCodeRepository;

  let EmailCodeModel: any;

  let mockedExecFindOne: jest.Mock;
  let mockedSavePrototype: jest.Mock;

  beforeEach(async () => {
    EmailCodeModel = jest.fn();

    repository = new MongooseEmailCodeRepository(EmailCodeModel);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(EmailCodeModel).toBeDefined();
  });

  describe('findOne', () => {
    beforeEach(() => {
      mockedExecFindOne = jest.fn().mockReturnValue(mockEmailCodeLikeJSON());
      EmailCodeModel.findOne = jest.fn().mockReturnValue({
        exec: mockedExecFindOne,
      });
    });

    it('should return user with one field', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
      });

      expect(EmailCodeModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(mockEmailCodeLikeJSON());
      expect(response.email).toBe(EmailConstants.EXEMPLE);
    });

    it('should return user with many fields', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
        code: 'AAAAAA',
      });

      expect(EmailCodeModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(mockEmailCodeLikeJSON());
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
    const emailCode = mockEmailCodeLikeJSON();

    beforeEach(() => {
      mockedSavePrototype = jest.fn().mockReturnValue(undefined);
      EmailCodeModel.prototype.save = mockedSavePrototype;
    });

    it('should save user', async () => {
      const response = await repository.save(emailCode);

      expect(response).toBeUndefined();
      expect(EmailCodeModel).toHaveBeenCalledWith(emailCode);
      expect(mockedSavePrototype).toHaveBeenCalled();
    });
  });
});
