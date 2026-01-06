import { JWTResetPassTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';
import { JwtPayloadValidator } from './jwt-payload.validator';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';

describe('JwtPayloadValidator', () => {
  describe('validate', () => {
    const payload: JWTResetPassTokenPayLoad = {
      exp: 100,
      iat: 1200,
      sub: IDConstants.EXEMPLE,
      type: 'reset-pass',
    };

    it('should dont throw Error on sucess', async () => {
      expect(() =>
        JwtPayloadValidator.validate(payload, 'Error', 'reset-pass'),
      ).not.toThrow();
    });

    it('should throw Error WrongCredentials if payload is null or undefined', async () => {
      try {
        JwtPayloadValidator.validate(null, 'Error', 'reset-pass');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe('Error');
        expect(error.data).toBe(undefined);
      }

      try {
        JwtPayloadValidator.validate(undefined, 'Error', 'reset-pass');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe('Error');
        expect(error.data).toBe(undefined);
      }
    });

    it('should throw Error WrongCredentials if payload type diffeent from expectedType', async () => {
      try {
        JwtPayloadValidator.validate(payload, 'Error', 'access');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(WrongCredentials);
        expect(error.message).toBe('Error');
        expect(error.data).toBe(undefined);
      }
    });
  });
});
