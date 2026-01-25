import { FieldInvalid } from '@auth/domain/ports/primary/http/errors.port';
import IDConstants from './id-constants';
import IDValidator from './id-validator';

describe('IDValidator', () => {
  it('should not throw an error for a valid UUID', () => {
    expect(() => IDValidator.validate(IDConstants.EXEMPLE)).not.toThrow();
  });

  it('should throw an error if the value is empty', () => {
    try {
      IDValidator.validate('');
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(IDConstants.ERROR_REQUIRED);
      expect(error.data).toBe('id');
    }
    try {
      IDValidator.validate(null);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(IDConstants.ERROR_REQUIRED);
      expect(error.data).toBe('id');
    }

    try {
      IDValidator.validate(undefined);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(IDConstants.ERROR_REQUIRED);
      expect(error.data).toBe('id');
    }
  });

  it('should throw an error if the value is not a string', () => {
    const nonStringValue = 12345 as any;

    try {
      IDValidator.validate(nonStringValue);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(IDConstants.ERROR_STRING);
      expect(error.data).toBe('id');
    }
  });

  it('should throw an error if the value is not a valid UUID', () => {
    try {
      IDValidator.validate(IDConstants.ERROR_INVALID_EXEMPLE);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(FieldInvalid);
      expect(error.message).toBe(IDConstants.ERROR_INVALID);
      expect(error.data).toBe('id');
    }
  });
});
