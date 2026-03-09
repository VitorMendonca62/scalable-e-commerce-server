import { Cookies } from '@auth/domain/enums/cookies.enum';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

describe('AuthController (E2E)', () => {
  const BASE_URL = `http://localhost:8081`;

  describe('GET /auth/google', () => {
    it('should return Google OAuth2 URL', () => {
      return request(BASE_URL)
        .get('/auth/google')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.text).toContain(
            'https://accounts.google.com/o/oauth2/v2/auth',
          );
          expect(res.text).toContain('response_type=code');
          expect(res.text).toContain('scope=email%20profile');
        });
    });

    it('should include client_id in the response', () => {
      return request(BASE_URL)
        .get('/auth/google')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.text).toContain(
            `client_id=${process.env.GOOGLE_CLIENT_ID}`,
          );
        });
    });

    it('should include redirect_uri in the response', () => {
      return request(BASE_URL)
        .get('/auth/google')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.text).toContain(
            `redirect_uri=${process.env.GOOGLE_CALLBACK_URL}`,
          );
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should handle concurrent login attempts', () => {
      return Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          request(BASE_URL)
            .post('/auth/login')
            .send({
              email: `user${i}@example.com`,
              password: 'Password123!',
            }),
        ),
      );
    });

    it('should reject login with invalid email format', async () => {
      return request(BASE_URL)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('O email deve ser válido');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject login with empty email', () => {
      return request(BASE_URL)
        .post('/auth/login')
        .send({
          email: '',
          password: 'Password123!',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('O email é obrigatório');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject login with missing email field', () => {
      return request(BASE_URL)
        .post('/auth/login')
        .send({
          password: 'Password123!',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('O email é obrigatório');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject login with empty password', () => {
      return request(BASE_URL)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: '',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('A senha é obrigatória');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('password');
        });
    });

    it('should reject login with missing password field', () => {
      return request(BASE_URL)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('A senha é obrigatória');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('password');
        });
    });

    it('should reject login with non-existent user', () => {
      return request(BASE_URL)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Suas credenciais estão incorretas. Tente novamente',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject login with invalid password', () => {
      return request(BASE_URL)
        .post('/auth/login')
        .send({
          email: 'vitormsi2005@gmail.com',
          password: 'WrongPassword123!',
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Suas credenciais estão incorretas. Tente novamente',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should return sucess message when user and password is valid', () => {
      return request(BASE_URL)
        .post('/auth/login')
        .send({
          email: 'vitormsi20052@gmail.com',
          password: '@Vh123443',
        })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário realizou login com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.CREATED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should set cookies when user and password is valid', () => {
      return request(BASE_URL)
        .post('/auth/login')
        .send({
          email: 'vitormsi20052@gmail.com',
          password: '@Vh123443',
        })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          const cookies = res.headers['set-cookie'] as unknown as string[];

          expect(cookies).toHaveLength(2);

          const refreshTokenCookie = cookies.find((c) =>
            c.startsWith('refresh_token='),
          );
          const accessTokenCookie = cookies.find((c) =>
            c.startsWith('access_token='),
          );

          expect(refreshTokenCookie).toBeDefined();
          expect(accessTokenCookie).toBeDefined();

          expect(refreshTokenCookie).toContain('HttpOnly');
          expect(refreshTokenCookie).toContain('SameSite=Strict');
          expect(accessTokenCookie).toContain('HttpOnly');
          expect(accessTokenCookie).toContain('SameSite=Strict');
        });
    });
  });

  describe('GET /auth/token', () => {
    it('should reject token request without x-user-id header', () => {
      return request(BASE_URL)
        .get('/auth/token')
        .set('x-token-id', 'some-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request without x-token-id header', () => {
      return request(BASE_URL)
        .get('/auth/token')
        .set('x-user-id', '...')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with missing both required headers', () => {
      return request(BASE_URL)
        .get('/auth/token')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with empty x-user-id header', () => {
      return request(BASE_URL)
        .get('/auth/token')
        .set('x-user-id', '')
        .set('x-token-id', 'some-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with empty x-token-id header', () => {
      return request(BASE_URL)
        .get('/auth/token')
        .set('x-user-id', 'some-user-id')
        .set('x-token-id', '')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with non-existent token', () => {
      return request(BASE_URL)
        .get('/auth/token')
        .set('x-user-id', '507f1f77bcf86cd799439011')
        .set('x-token-id', 'non-existent-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with revoked token', () => {
      return request(BASE_URL)
        .get('/auth/token')
        .set('x-user-id', '507f1f77bcf86cd799439011')
        .set('x-token-id', 'revoked-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });
  });

  describe('POST /auth/logout', () => {
    it('should reject token request without x-user-id header', () => {
      return request(BASE_URL)
        .post('/auth/logout')
        .set('x-token-id', 'some-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request without x-token-id header', () => {
      return request(BASE_URL)
        .post('/auth/logout')
        .set('x-user-id', '...')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with missing both required headers', () => {
      return request(BASE_URL)
        .post('/auth/logout')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with empty x-user-id header', () => {
      return request(BASE_URL)
        .post('/auth/logout')
        .set('x-user-id', '')
        .set('x-token-id', 'some-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with empty x-token-id header', () => {
      return request(BASE_URL)
        .post('/auth/logout')
        .set('x-user-id', 'some-user-id')
        .set('x-token-id', '')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with non-existent token', () => {
      return request(BASE_URL)
        .post('/auth/logout')
        .set('x-user-id', '507f1f77bcf86cd799439011')
        .set('x-token-id', 'non-existent-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with revoked token', () => {
      return request(BASE_URL)
        .post('/auth/logout')
        .set('x-user-id', '507f1f77bcf86cd799439011')
        .set('x-token-id', 'revoked-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });
  });
});
