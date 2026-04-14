import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from '../src/app.module';
import AppConfig from '@config/app.config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { HttpExceptionFilter } from '@user/infrastructure/adaptars/primary/http/filters/http-exceptions-filter';
import UserRepository from '@user/domain/ports/secondary/user-repository.port';
import { defaultRoles } from '@user/domain/constants/roles';
import { UserRecord } from '@user/domain/types/user-record';
import {
  CityConstants,
  ComplementConstants,
  CountryConstants,
  NeighborhoodConstants,
  NumberConstants,
  PostalCodeConstants,
  StateConstants,
  StreetConstants,
} from '@user/domain/values-objects/address/constants';
import {
  EmailConstants,
  NameConstants,
  PhoneNumberConstants,
  UsernameConstants,
} from '@user/domain/values-objects/user/constants';
import { HttpStatus } from '@nestjs/common';
import { v7 } from 'uuid';
import { AddressDTOFactory } from '@user/infrastructure/helpers/address/factory';
import { AddUserAddressDTO } from '@user/infrastructure/adaptars/primary/http/dtos/add-user-address.dto';

describe('AddressController (E2E)', () => {
  let app: NestFastifyApplication;
  let userRepository: UserRepository;

  const seedUser = async (overrides: Partial<UserRecord> = {}) => {
    const now = new Date();
    const unique = v7();
    const userRecord: UserRecord = {
      userID: unique,
      name: `address ${NameConstants.EXEMPLE}`,
      username: `address-${UsernameConstants.EXEMPLE}-${unique}`,
      email: `address-${unique}-${EmailConstants.EXEMPLE}`,
      avatar: null,
      phoneNumber: PhoneNumberConstants.EXEMPLE,
      roles: defaultRoles,
      addresses: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: overrides.deletedAt ?? null,
      ...overrides,
    };

    await userRepository.create(userRecord);
    return userRecord;
  };

  const createAddressPayload = (overrides: Partial<AddUserAddressDTO> = {}) =>
    AddressDTOFactory.createAddUserAddressDTO(overrides);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        bodyLimit: 10485760,
        logger: false,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    const configService =
      app.get<ConfigService<EnvironmentVariables>>(ConfigService);

    await app.register(fastifyCookie as any, {
      secret: configService.get<string>('COOKIE_SECRET'),
    });

    const appConfig = new AppConfig(configService, app);
    appConfig.configValidationPipe();
    appConfig.configCors();

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    userRepository = app.get(UserRepository);
  });

  const httpServer = () => app.getHttpServer();

  describe('POST /address', () => {
    describe('reject street', () => {
      it('should reject when street is missing', async () => {
        const user = await seedUser();
        const payload = createAddressPayload();
        delete (payload as any).street;

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(StreetConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('street');
          });
      });

      it('should reject when street is undefined', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({ street: undefined });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(StreetConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('street');
          });
      });

      it('should reject when street is not string', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          street: StreetConstants.ERROR_STRING_EXEMPLE as any,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(StreetConstants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('street');
          });
      });

      it('should reject when street length is short', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          street: StreetConstants.ERROR_TOO_SHORT_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(StreetConstants.ERROR_TOO_SHORT);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('street');
          });
      });

      it('should reject when street length is long', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          street: StreetConstants.ERROR_TOO_LONG_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(StreetConstants.ERROR_TOO_LONG);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('street');
          });
      });
    });

    describe('reject number', () => {
      const constants = NumberConstants;
      const key = 'number';

      it('should reject when key is missing', async () => {
        const user = await seedUser();
        const payload = createAddressPayload();
        delete (payload as any).number;

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is undefined', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({ [key]: undefined });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not string', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_STRING_EXEMPLE as any,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is long', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_TOO_LONG_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_TOO_LONG);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject complement', () => {
      const constants = ComplementConstants;
      const key = 'complement';

      it('should accepted when key is missing', async () => {
        const user = await seedUser();
        const payload = createAddressPayload();
        delete (payload as any).complement;

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.CREATED);
      });

      it('should accepted when key is undefined', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({ complement: undefined });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.CREATED);
      });

      it('should reject when key is not string', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_STRING_EXEMPLE as any,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is long', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_TOO_LONG_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_TOO_LONG);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject neighborhood', () => {
      const constants = NeighborhoodConstants;
      const key = 'neighborhood';

      it('should reject when key is missing', async () => {
        const user = await seedUser();
        const payload = createAddressPayload();
        delete (payload as any).neighborhood;

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should accepted when key is undefined', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({ neighborhood: undefined });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not string', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_STRING_EXEMPLE as any,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is short', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_TOO_SHORT_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_TOO_SHORT);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is long', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_TOO_LONG_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_TOO_LONG);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject city', () => {
      const constants = CityConstants;
      const key = 'city';

      it('should accepted when key is missing', async () => {
        const user = await seedUser();
        const payload = createAddressPayload();
        delete (payload as any).city;

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should accepted when key is undefined', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({ [key]: undefined });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not string', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_STRING_EXEMPLE as any,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is short', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_TOO_SHORT_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_TOO_SHORT);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is long', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_TOO_LONG_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_TOO_LONG);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject postalCode', () => {
      const constants = PostalCodeConstants;
      const key = 'postalCode';

      it('should accepted when key is missing', async () => {
        const user = await seedUser();
        const payload = createAddressPayload();
        delete (payload as any).postalCode;

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should accepted when key is undefined', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({ [key]: undefined });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not string', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_STRING_EXEMPLE as any,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is invalid', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not number string', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_INVALID_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_INVALID);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject state', () => {
      const constants = StateConstants;
      const key = 'state';

      it('should accepted when key is missing', async () => {
        const user = await seedUser();
        const payload = createAddressPayload();
        delete (payload as any).state;

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should accepted when key is undefined', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({ [key]: undefined });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not string', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_STRING_EXEMPLE as any,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is invalid', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not in enum', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_INVALID_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_NOT_BRAZIL_STATE);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject country', () => {
      const constants = CountryConstants;
      const key = 'country';

      it('should accepted when key is missing', async () => {
        const user = await seedUser();
        const payload = createAddressPayload();
        delete (payload as any).country;

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should accepted when key is undefined', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({ [key]: undefined });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not string', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_STRING_EXEMPLE as any,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is short', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_TOO_SHORT_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_TOO_SHORT);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is long', async () => {
        const user = await seedUser();
        const payload = createAddressPayload({
          [key]: constants.ERROR_TOO_LONG_EXEMPLE,
        });

        return request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_TOO_LONG);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    it('should create address successfully', async () => {
      const user = await seedUser();
      const payload = createAddressPayload();
      delete (payload as any).complement;

      return request(httpServer())
        .post('/address')
        .set('x-user-id', user.userID)
        .send(payload)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.message).toBe('Endereço criado com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.CREATED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject when user reaches address limit', async () => {
      const user = await seedUser();
      const payload = createAddressPayload();

      for (let i = 0; i < 3; i += 1) {
        await request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload)
          .expect(HttpStatus.CREATED);
      }

      return request(httpServer())
        .post('/address')
        .set('x-user-id', user.userID)
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'O usuário já possui o número máximo de endereços permitidos (3).',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it('should not allow creating more than limit concurrently', async () => {
      const user = await seedUser();
      const payload = createAddressPayload();

      const requests = Array.from({ length: 5 }, () =>
        request(httpServer())
          .post('/address')
          .set('x-user-id', user.userID)
          .send(payload),
      );

      const responses = await Promise.all(requests);
      const created = responses.filter(
        (response) => response.status === HttpStatus.CREATED,
      );
      const rejected = responses.filter(
        (response) => response.status === HttpStatus.BAD_REQUEST,
      );

      expect(created).toHaveLength(3);
      expect(rejected).toHaveLength(2);
      rejected.forEach((response) => {
        expect(response.body.message).toBe(
          'O usuário já possui o número máximo de endereços permitidos (3).',
        );
        expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe('GET /address', () => {
    it('should return not found when user has no addresses', async () => {
      const user = await seedUser();

      return request(httpServer())
        .get('/address')
        .set('x-user-id', user.userID)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Não foi possível encontrar os endereços do usuário.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    it('should return all addresses for user', async () => {
      const user = await seedUser();
      const payload = createAddressPayload({
        city: 'unique',
      });

      await request(httpServer())
        .post('/address')
        .set('x-user-id', user.userID)
        .send(payload)
        .expect(HttpStatus.CREATED);

      return request(httpServer())
        .get('/address')
        .set('x-user-id', user.userID)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Aqui está todos os endereços do usuário',
          );
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0]).toMatchObject({
            city: 'unique',
            complement: ComplementConstants.EXEMPLE,
            country: CountryConstants.EXEMPLE,
            neighborhood: NeighborhoodConstants.EXEMPLE,
            number: NumberConstants.EXEMPLE,
            postalCode: PostalCodeConstants.EXEMPLE,
            state: StateConstants.EXEMPLE,
            street: StreetConstants.EXEMPLE,
          });
          expect(res.body.data[0].addressId).toBeDefined();
        });
    });

    it("should not allow accessing another user's address", async () => {
      const owner = await seedUser();
      const otherUser = await seedUser();
      const payload = createAddressPayload();

      await request(httpServer())
        .post('/address')
        .set('x-user-id', owner.userID)
        .send(payload)
        .expect(HttpStatus.CREATED);

      return request(httpServer())
        .get('/address')
        .set('x-user-id', otherUser.userID)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Não foi possível encontrar os endereços do usuário.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });
  });

  describe('DELETE /address/:addressId', () => {
    it('should return not found when address does not exist', async () => {
      const user = await seedUser();

      return request(httpServer())
        .delete('/address/9999')
        .set('x-user-id', user.userID)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Não foi possivel encontrar o endereço',
          );
          expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });
    
    it("should not allow deleting another user's address", async () => {
      const owner = await seedUser();
      const otherUser = await seedUser();
      const payload = createAddressPayload();

      await request(httpServer())
        .post('/address')
        .set('x-user-id', owner.userID)
        .send(payload)
        .expect(HttpStatus.CREATED);

      const listResponse = await request(httpServer())
        .get('/address')
        .set('x-user-id', owner.userID)
        .expect(HttpStatus.OK);

      const addressId = listResponse.body.data[0].addressId;

      return request(httpServer())
        .delete(`/address/${addressId}`)
        .set('x-user-id', otherUser.userID)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Não foi possivel encontrar o endereço',
          );
          expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    it('should not delete address from another user', async () => {
      const owner = await seedUser();
      const otherUser = await seedUser();
      const payload = createAddressPayload();

      await request(httpServer())
        .post('/address')
        .set('x-user-id', owner.userID)
        .send(payload)
        .expect(HttpStatus.CREATED);

      const listResponse = await request(httpServer())
        .get('/address')
        .set('x-user-id', owner.userID)
        .expect(HttpStatus.OK);

      const addressId = listResponse.body.data[0].addressId;

      await request(httpServer())
        .delete(`/address/${addressId}`)
        .set('x-user-id', otherUser.userID)
        .expect(HttpStatus.NOT_FOUND);

      await request(httpServer())
        .get('/address')
        .set('x-user-id', owner.userID)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].addressId).toBe(addressId);
        });
    });

    it('should delete address successfully', async () => {
      const user = await seedUser();
      const payload = createAddressPayload();

      await request(httpServer())
        .post('/address')
        .set('x-user-id', user.userID)
        .send(payload)
        .expect(HttpStatus.CREATED);

      const listResponse = await request(httpServer())
        .get('/address')
        .set('x-user-id', user.userID)
        .expect(HttpStatus.OK);

      const addressId = listResponse.body.data[0].addressId;

      await request(httpServer())
        .delete(`/address/${addressId}`)
        .set('x-user-id', user.userID)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('Endereço deletado com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
        });

      await request(httpServer())
        .get('/address')
        .set('x-user-id', user.userID)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
