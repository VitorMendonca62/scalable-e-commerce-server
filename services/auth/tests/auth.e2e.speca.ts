// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication, HttpStatus } from '@nestjs/common';
// import request from 'supertest';
// import { ConfigService } from '@nestjs/config';
// import { EnvironmentVariables } from '@config/environment/env.validation';
// import { AppModule } from '../src/app.module';
// import {
//   FastifyAdapter,
//   NestFastifyApplication,
// } from '@nestjs/platform-fastify';
// import { GoogleStrategy } from '@auth/infrastructure/adaptars/primary/http/strategies/google.strategy';

// describe('AuthController (E2E)', () => {
//   let app: INestApplication;
//   let configService: ConfigService<EnvironmentVariables>;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     })
//       .overrideProvider(GoogleStrategy)
//       .useValue({})
//       .compile();

//     app = moduleFixture.createNestApplication<NestFastifyApplication>(
//       new FastifyAdapter(),
//     );

//     await app.init();
//     await app.getHttpAdapter().getInstance().ready();
//   });

//   afterAll(async () => {
//     await app.close();
//   });

//   describe('GET /auth/google', () => {
//     it('should return Google OAuth2 URL', () => {
//       return request(app.getHttpServer())
//         .get('/auth/google')
//         .expect(HttpStatus.OK)
//         .expect((res) => {
//           expect(res.text).toContain(
//             'https://accounts.google.com/o/oauth2/v2/auth',
//           );
//           expect(res.text).toContain('response_type=code');
//           expect(res.text).toContain('scope=email%20profile');
//           expect(res.text).toContain('client_id=');
//         });
//     });

//     it('should include client_id in the response', () => {
//       return request(app.getHttpServer())
//         .get('/auth/google')
//         .expect(HttpStatus.OK)
//         .expect((res) => {
//           const clientID = configService.get('GOOGLE_CLIENT_ID');
//           expect(res.text).toContain(`client_id=${clientID}`);
//         });
//     });

//     it('should include redirect_uri in the response', () => {
//       return request(app.getHttpServer())
//         .get('/auth/google')
//         .expect(HttpStatus.OK)
//         .expect((res) => {
//           const callbackUrl = configService.get('GOOGLE_CALLBACK_URL');
//           expect(res.text).toContain(`redirect_uri=${callbackUrl}`);
//         });
//     });
//   });

//   describe('POST /auth/login', () => {
//     it('should reject login with invalid email format', async () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           email: 'invalid-email',
//           password: 'Password123!',
//         })
//         .expect(HttpStatus.BAD_REQUEST)
//         .expect();
//     });

//     it('should reject login with empty email', () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           email: '',
//           password: 'Password123!',
//         })
//         .expect(HttpStatus.BAD_REQUEST);
//     });

//     it('should reject login with empty password', () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           email: 'user@example.com',
//           password: '',
//         })
//         .expect(HttpStatus.BAD_REQUEST);
//     });

//     it('should reject login with missing email field', () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           password: 'Password123!',
//         })
//         .expect(HttpStatus.BAD_REQUEST);
//     });

//     it('should reject login with missing password field', () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           email: 'user@example.com',
//         })
//         .expect(HttpStatus.BAD_REQUEST);
//     });

//     it('should reject login with non-existent user', () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           email: 'nonexistent@example.com',
//           password: 'Password123!',
//         })
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject login with invalid password', () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           email: 'user@example.com',
//           password: 'WrongPassword123!',
//         })
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should send valid request body without validation errors', () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           email: 'user@example.com',
//           password: 'Password123!',
//         })
//         .expect((res) => {
//           // Should not return BAD_REQUEST (400) for format validation
//           expect(res.status).not.toBe(HttpStatus.BAD_REQUEST);
//         });
//     });

//     it('should reject login with very long email', () => {
//       const longEmail = 'a'.repeat(255) + '@example.com';
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           email: longEmail,
//           password: 'Password123!',
//         })
//         .expect(HttpStatus.BAD_REQUEST);
//     });

//     it('should reject login with special characters in email', () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           email: 'user<script>@example.com',
//           password: 'Password123!',
//         })
//         .expect(HttpStatus.BAD_REQUEST);
//     });
//   });

//   describe('GET /auth/token', () => {
//     it('should reject token request without x-user-id header', () => {
//       return request(app.getHttpServer())
//         .get('/auth/token')
//         .set('x-token-id', 'some-token-id')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject token request without x-token-id header', () => {
//       return request(app.getHttpServer())
//         .get('/auth/token')
//         .set('x-user-id', '...')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject token request with missing both required headers', () => {
//       return request(app.getHttpServer())
//         .get('/auth/token')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject token request with empty x-user-id header', () => {
//       return request(app.getHttpServer())
//         .get('/auth/token')
//         .set('x-user-id', '')
//         .set('x-token-id', 'some-token-id')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject token request with empty x-token-id header', () => {
//       return request(app.getHttpServer())
//         .get('/auth/token')
//         .set('x-user-id', 'some-user-id')
//         .set('x-token-id', '')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject token request with invalid user-id format', () => {
//       return request(app.getHttpServer())
//         .get('/auth/token')
//         .set('x-user-id', 'invalid-format')
//         .set('x-token-id', 'some-token-id')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject token request with non-existent token', () => {
//       return request(app.getHttpServer())
//         .get('/auth/token')
//         .set('x-user-id', '507f1f77bcf86cd799439011')
//         .set('x-token-id', 'non-existent-token-id')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject token request with revoked token', () => {
//       return request(app.getHttpServer())
//         .get('/auth/token')
//         .set('x-user-id', '507f1f77bcf86cd799439011')
//         .set('x-token-id', 'revoked-token-id')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });
//   });

//   describe('POST /auth/logout', () => {
//     it('should reject logout without x-user-id header', () => {
//       return request(app.getHttpServer())
//         .post('/auth/logout')
//         .set('x-token-id', 'some-token-id')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject logout without x-token-id header', () => {
//       return request(app.getHttpServer())
//         .post('/auth/logout')
//         .set('x-user-id', 'some-user-id')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject logout with missing both required headers', () => {
//       return request(app.getHttpServer())
//         .post('/auth/logout')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject logout with empty x-user-id header', () => {
//       return request(app.getHttpServer())
//         .post('/auth/logout')
//         .set('x-user-id', '')
//         .set('x-token-id', 'some-token-id')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject logout with empty x-token-id header', () => {
//       return request(app.getHttpServer())
//         .post('/auth/logout')
//         .set('x-user-id', 'some-user-id')
//         .set('x-token-id', '')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject logout with invalid user-id format', () => {
//       return request(app.getHttpServer())
//         .post('/auth/logout')
//         .set('x-user-id', 'invalid-format')
//         .set('x-token-id', 'some-token-id')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should handle logout with expired token', () => {
//       return request(app.getHttpServer())
//         .post('/auth/logout')
//         .set('x-user-id', '507f1f77bcf86cd799439011')
//         .set('x-token-id', 'expired-token-id')
//         .expect((res) => {
//           // Should not be OK or CREATED, but can be NO_CONTENT or UNAUTHORIZED
//           expect([
//             HttpStatus.UNAUTHORIZED,
//             HttpStatus.NO_CONTENT,
//             HttpStatus.UNPROCESSABLE_ENTITY,
//           ]).toContain(res.status);
//         });
//     });

//     it('should handle logout with non-existent user', () => {
//       return request(app.getHttpServer())
//         .post('/auth/logout')
//         .set('x-user-id', '507f1f77bcf86cd799439011')
//         .set('x-token-id', 'some-valid-token-id')
//         .expect((res) => {
//           expect([
//             HttpStatus.UNAUTHORIZED,
//             HttpStatus.NO_CONTENT,
//             HttpStatus.UNPROCESSABLE_ENTITY,
//           ]).toContain(res.status);
//         });
//     });
//   });

//   describe('GET /auth/google/callback', () => {
//     it('should reject callback without authorization code', () => {
//       return request(app.getHttpServer())
//         .get('/auth/google/callback')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject callback with invalid authorization code', () => {
//       return request(app.getHttpServer())
//         .get('/auth/google/callback?code=invalid_code')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should handle callback with empty authorization code', () => {
//       return request(app.getHttpServer())
//         .get('/auth/google/callback?code=')
//         .expect(HttpStatus.UNAUTHORIZED);
//     });

//     it('should reject callback without state parameter when needed', () => {
//       return request(app.getHttpServer())
//         .get('/auth/google/callback?code=some_code')
//         .expect((res) => {
//           expect([HttpStatus.UNAUTHORIZED, HttpStatus.BAD_REQUEST]).toContain(
//             res.status,
//           );
//         });
//     });
//   });

//   describe('POST /auth/login - Request Validation', () => {
//     it('should accept valid email format variations', () => {
//       const validEmails = [
//         'user@example.com',
//         'user.name@example.com',
//         'user+tag@example.com',
//       ];

//       return Promise.all(
//         validEmails.map((email) =>
//           request(app.getHttpServer())
//             .post('/auth/login')
//             .send({
//               email,
//               password: 'Password123!',
//             })
//             .expect((res) => {
//               // Should not fail on validation
//               expect(res.status).not.toBe(HttpStatus.BAD_REQUEST);
//             }),
//         ),
//       );
//     });

//     it('should reject invalid email formats', () => {
//       const invalidEmails = [
//         'plainaddress',
//         '@example.com',
//         'user@',
//         'user @example.com',
//         'user@example .com',
//       ];

//       return Promise.all(
//         invalidEmails.map((email) =>
//           request(app.getHttpServer())
//             .post('/auth/login')
//             .send({
//               email,
//               password: 'Password123!',
//             })
//             .expect(HttpStatus.BAD_REQUEST),
//         ),
//       );
//     });
//   });

//   describe('GET /auth/token - Response Headers', () => {
//     it('should return appropriate content-type header', () => {
//       return request(app.getHttpServer())
//         .get('/auth/token')
//         .set('x-user-id', '507f1f77bcf86cd799439011')
//         .set('x-token-id', 'token-id')
//         .expect((res) => {
//           expect(res.headers['content-type']).toBeDefined();
//         });
//     });
//   });

//   describe('POST /auth/logout - Cookie Handling', () => {
//     it('should attempt to clear authentication cookies on logout', () => {
//       return request(app.getHttpServer())
//         .post('/auth/logout')
//         .set('x-user-id', '507f1f77bcf86cd799439011')
//         .set('x-token-id', 'valid-token-id')
//         .expect((res) => {
//           // Response should attempt to clear cookies
//           const setCookieHeaders = res.headers['set-cookie'] || [];
//           const cookieString = Array.isArray(setCookieHeaders)
//             ? setCookieHeaders.join('; ')
//             : setCookieHeaders;

//           // Either cookies are cleared or request is unauthorized
//           expect(
//             res.status === HttpStatus.NO_CONTENT ||
//               res.status === HttpStatus.UNAUTHORIZED ||
//               cookieString.toLowerCase().includes('max-age=0') ||
//               cookieString.toLowerCase().includes('expires'),
//           ).toBe(true);
//         });
//     });
//   });

//   describe('Auth Endpoints - HTTP Method Validation', () => {
//     it('should reject DELETE request to /auth/login', () => {
//       return request(app.getHttpServer())
//         .delete('/auth/login')
//         .expect((res) => {
//           expect(res.status).not.toBe(HttpStatus.OK);
//           expect([
//             HttpStatus.METHOD_NOT_ALLOWED,
//             HttpStatus.NOT_FOUND,
//           ]).toContain(res.status);
//         });
//     });

//     it('should reject PUT request to /auth/token', () => {
//       return request(app.getHttpServer())
//         .put('/auth/token')
//         .expect((res) => {
//           expect(res.status).not.toBe(HttpStatus.OK);
//           expect([
//             HttpStatus.METHOD_NOT_ALLOWED,
//             HttpStatus.NOT_FOUND,
//           ]).toContain(res.status);
//         });
//     });

//     it('should reject PATCH request to /auth/logout', () => {
//       return request(app.getHttpServer())
//         .patch('/auth/logout')
//         .expect((res) => {
//           expect(res.status).not.toBe(HttpStatus.OK);
//           expect([
//             HttpStatus.METHOD_NOT_ALLOWED,
//             HttpStatus.NOT_FOUND,
//           ]).toContain(res.status);
//         });
//     });
//   });

//   describe('Auth Endpoints - Response Body Structure', () => {
//     it('GET /auth/google should return a string URL', () => {
//       return request(app.getHttpServer())
//         .get('/auth/google')
//         .expect(HttpStatus.OK)
//         .expect((res) => {
//           expect(typeof res.text).toBe('string');
//           expect(res.text.length).toBeGreaterThan(0);
//         });
//     });

//     it('POST /auth/login with valid format should return structured response', () => {
//       return request(app.getHttpServer())
//         .post('/auth/login')
//         .send({
//           email: 'user@example.com',
//           password: 'Password123!',
//         })
//         .expect((res) => {
//           // Should have proper response structure
//           if (res.status !== HttpStatus.BAD_REQUEST) {
//             expect(res.body).toBeDefined();
//           }
//         });
//     });
//   });

//   describe('Auth Endpoints - Concurrent Requests', () => {
//     it('should handle concurrent login attempts', () => {
//       return Promise.all(
//         Array.from({ length: 5 }, (_, i) =>
//           request(app.getHttpServer())
//             .post('/auth/login')
//             .send({
//               email: `user${i}@example.com`,
//               password: 'Password123!',
//             }),
//         ),
//       );
//     });

//     it('should handle concurrent token refresh attempts', () => {
//       const userID = '507f1f77bcf86cd799439011';
//       const tokenID = 'token-id';

//       return Promise.all(
//         Array.from({ length: 3 }, () =>
//           request(app.getHttpServer())
//             .get('/auth/token')
//             .set('x-user-id', userID)
//             .set('x-token-id', tokenID),
//         ),
//       );
//     });
//   });
// });
