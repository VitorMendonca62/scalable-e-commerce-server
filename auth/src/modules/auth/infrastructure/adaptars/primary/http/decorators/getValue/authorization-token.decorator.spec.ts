import { extractAuthorizationToken } from './authorization-token.decorator';

describe('AuthorizationToken', () => {
  const switchToHttpMock: jest.Mock = jest.fn();
  const getRequestMock: jest.Mock = jest.fn();
  const executionContext = { switchToHttp: switchToHttpMock };

  const token = 'Bearer abc123';

  const headers = {
    headers: {
      authorization: token,
    },
  };

  beforeEach(() => {
    getRequestMock.mockReturnValue(headers);

    switchToHttpMock.mockReturnValue({ getRequest: getRequestMock });
  });

  it('should return the authorization header from request', () => {
    const result = extractAuthorizationToken(executionContext as any);

    expect(result).toBe(token);
  });

  it('should return undefined if authorization header is missing', () => {
    getRequestMock.mockReturnValue({ headers: {} });

    const result = extractAuthorizationToken(executionContext as any);

    expect(result).toBeUndefined();
  });
});
