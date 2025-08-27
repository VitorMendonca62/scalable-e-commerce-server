import { FieldInvalid } from '@modules/auth/domain/ports/primary/http/errors.port';
import { BearerTokenPipe } from './bearer-token.pipe';

describe('BearerTokenPipe', () => {
  let pipe: BearerTokenPipe;

  const token = 'abc123';
  const authorization = `Bearer ${token}`;

  beforeAll(() => {
    pipe = new BearerTokenPipe();
  });

  it('should return only token', () => {
    const response = pipe.transform(authorization);

    expect(response).toBe(token);
    expect(typeof response).toBe('string');
  });

  it('should throw field invalid when value is undefined or null', () => {
    expect(() => pipe.transform(undefined)).toThrow(
      new FieldInvalid('Você não tem permissão', 'refresh_token'),
    );

    expect(() => pipe.transform(null)).toThrow(
      new FieldInvalid('Você não tem permissão', 'refresh_token'),
    );
  });

  it('should throw value dont starts with bearer', () => {
    expect(() => pipe.transform('T0k3n')).toThrow(
      new FieldInvalid('Você não tem permissão', 'refresh_token'),
    );
  });
});
