import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { v7 } from 'uuid';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import AppConfig from '../src/config/app.config';
import { PaymentTypes } from '../src/modules/product/domain/enums/payments-types.enum';
import { CategoryRepository } from '../src/modules/product/domain/ports/secondary/category-repository.port';
import { HttpStatus } from '@nestjs/common';
import {
  ActiveConstants,
  CategoryConstants,
  DescriptionConstants,
  OverviewConstants,
  PaymentsConstants,
  PhotosConstants,
  PriceConstants,
  StockConstants,
  TitleConstants,
} from '@product/domain/values-objects/constants';
import { Client } from 'pg';
import { title } from 'process';

describe('ProductController (e2e)', () => {
  let app: NestFastifyApplication;
  let categoryID: string;

  const userID = v7();

  let client: Client;

  const createProductPayload = (overrides?: Record<string, unknown>) => {
    const payload = {
      title: `Produto E2E ${Date.now()}`,
      price: 1299,
      description: 'Descricao do produto e2e',
      overview: 'Overview do produto e2e',
      photos: ['aW1hZ2Ux'],
      payments: [PaymentTypes.PIX],
      active: true,
      stock: 10,
      categoryID,
    };

    return { ...payload, ...(overrides ?? {}) };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    const configService = app.get(ConfigService);
    const appConfig = new AppConfig(configService, app);

    appConfig.configValidationPipe();
    appConfig.configCors();

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    client = new Client({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });

    await client.connect();
  });

  const httpServer = () => app.getHttpServer();

  describe('POST /product', () => {
    categoryID = v7();
    beforeAll(async () => {
      await app.get(CategoryRepository).create({
        name: `Categoria E2E ${Date.now()}`,
        publicID: categoryID,
      });
    });
    describe('reject title', () => {
      const constants = TitleConstants;
      const key = 'title';

      it('should reject when key is missing', async () => {
        const payload = createProductPayload();
        delete payload[key];

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is undefined', async () => {
        const payload = createProductPayload({ title: undefined });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not string', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_STRING_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is short', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MIN_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MIN_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is long', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MAX_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MAX_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject price', () => {
      const constants = PriceConstants;
      const key = 'price';

      it('should reject when key is missing', async () => {
        const payload = createProductPayload();
        delete payload[key];

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is undefined', async () => {
        const payload = createProductPayload({ [key]: undefined });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not integer', async () => {
        await request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(
            createProductPayload({
              [key]: constants.ERROR_INTEGER_EXEMPLE,
            }),
          )
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_INTEGER);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });

        await request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(
            createProductPayload({
              [key]: NaN,
            }),
          )
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });

        await request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(
            createProductPayload({
              [key]: Infinity,
            }),
          )
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not number', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_NUMBER_EXEMPLE,
        });

        await request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_NUMBER);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is minimum', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MIN_VALUE_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MIN_VALUE);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is maximum', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MAX_VALUE_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MAX_VALUE);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject description', () => {
      const constants = DescriptionConstants;
      const key = 'description';

      it('should reject when key is missing', async () => {
        const payload = createProductPayload();
        delete payload[key];

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is undefined', async () => {
        const payload = createProductPayload({ [key]: undefined });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not string', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_STRING_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is short', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MIN_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MIN_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is long', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MAX_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MAX_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject overview', () => {
      const constants = OverviewConstants;
      const key = 'overview';

      it('should reject when key is missing', async () => {
        const payload = createProductPayload();
        delete payload[key];

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is undefined', async () => {
        const payload = createProductPayload({ [key]: undefined });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not string', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_STRING_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is short', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MIN_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MIN_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is long', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MAX_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MAX_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject photos', () => {
      const constants = PhotosConstants;
      const key = 'photos';

      it('should reject when key is missing', async () => {
        const payload = createProductPayload();
        delete payload[key];

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is undefined', async () => {
        const payload = createProductPayload({ [key]: undefined });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not array', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_ARRAY_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_ARRAY);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is short', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MIN_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MIN_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is long', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MAX_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MAX_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject payments', () => {
      const constants = PaymentsConstants;
      const key = 'payments';

      it('should reject when key is missing', async () => {
        const payload = createProductPayload();
        delete payload[key];

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is undefined', async () => {
        const payload = createProductPayload({ [key]: undefined });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not array', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_ARRAY_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_ARRAY);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key length is short', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MIN_LENGTH_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MIN_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when not is in enum', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_INVALID_TYPE_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_INVALID_TYPE);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject active', () => {
      const constants = ActiveConstants;
      const key = 'active';

      it('should reject when key is missing', async () => {
        const payload = createProductPayload();
        delete payload[key];

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is undefined', async () => {
        const payload = createProductPayload({ [key]: undefined });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not boolean', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_BOOLEAN_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_BOOLEAN);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject stock', () => {
      const constants = StockConstants;
      const key = 'stock';

      it('should reject when key is missing', async () => {
        const payload = createProductPayload();
        delete payload[key];

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is undefined', async () => {
        const payload = createProductPayload({ [key]: undefined });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not number', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_NUMBER_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_NUMBER);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not integer', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_INTEGER_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_INTEGER);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is minimum', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MIN_VALUE_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MIN_VALUE);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is maximum', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_MAX_VALUE_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_MAX_VALUE);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    describe('reject category', () => {
      const constants = CategoryConstants;
      const key = 'categoryID';

      it('should reject when key is missing', async () => {
        const payload = createProductPayload();
        delete payload[key];

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is undefined', async () => {
        const payload = createProductPayload({ [key]: undefined });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not string', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_STRING_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is invalid', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_INVALID_EXEMPLE,
        });

        return request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_INVALID);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });
    });

    it('should reject when x-user-id is missing', async () => {
      const response = await request(httpServer())
        .post('/product')
        .send(createProductPayload());

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('Header x-user-id é obrigatório');
      expect(response.body.data).toBe('x-user-id');
    });

    it('should reject when category not already exists', async () => {
      const response = await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send(createProductPayload({ categoryID: v7() }));

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Não foi possivel criar o produto');
      expect(response.body.data).toBeUndefined();
    });

    it('should handle concurrent product creation', async () => {
      const payload = createProductPayload({ title: 'only-title' });

      const requests = Array.from({ length: 5 }, () =>
        request(httpServer())
          .post('/product')
          .set('x-user-id', userID)
          .send(payload),
      );

      const responses = await Promise.all(requests);
      const created = responses.filter(
        (response) => response.status === HttpStatus.CREATED,
      );
      const rejected = responses.filter(
        (response) => response.status !== HttpStatus.CREATED,
      );

      expect(created).toHaveLength(5);
      expect(rejected).toHaveLength(0);
    });

    it('should create product successfully', async () => {
      const payload = createProductPayload();
      const response = await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send(payload);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.message).toBe('Produto criado com sucesso');

      const result = await client.query(
        'SELECT * FROM products WHERE title = $1 AND owner = $2 AND category_id = $3 LIMIT 1',
        [payload.title, userID, categoryID],
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should reject product with override owner on payload', async () => {
      const payload = createProductPayload({ title: 'new title' });
      const newUserID = v7();

      const response = await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send({ ...payload, owner: newUserID });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('property owner should not exist');

      const result = await client.query(
        'SELECT * FROM products WHERE title = $1 AND category_id = $2 AND owner = $3 LIMIT 1',
        [payload.title, categoryID, userID],
      );
      expect(result.rows.length).toBe(0);
    });
  });

  // describe('GET /product/:id (3)', () => {
  //   it('should reject when x-user-id is missing', async () => {
  //     const productPayload = createProductPayload({
  //       title: `Produto E2E Missing Header ${Date.now()}`,
  //     });

  //     await request(httpServer())
  //       .post('/product')
  //       .set('x-user-id', userID)
  //       .send(productPayload);

  //     const result = await client.query(
  //       'SELECT public_id FROM products WHERE title = $1 LIMIT 1',
  //       [productPayload.title],
  //     );
  //     const productID = result.rows[0]?.public_id;

  //     const response = await request(httpServer()).get(`/product/${productID}`);

  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //     expect(response.body.message).toBe('Header x-user-id é obrigatório');
  //     expect(response.body.data).toBe('x-user-id');
  //   });

  //   it('should return not found for unknown product', async () => {
  //     const response = await request(httpServer())
  //       .get('/product/00000000-0000-0000-0000-000000000000')
  //       .set('x-user-id', userID);

  //     expect(response.status).toBe(404);
  //     expect(response.body.message).toBe(
  //       'Não foi possivel encontrar o produto',
  //     );
  //   });

  //   it('should return product by id', async () => {
  //     const productPayload = createProductPayload({
  //       title: `Produto E2E Get ${Date.now()}`,
  //     });

  //     await request(httpServer())
  //       .post('/product')
  //       .set('x-user-id', userID)
  //       .send(productPayload);

  //     const result = await client.query(
  //       'SELECT public_id FROM products WHERE title = $1 LIMIT 1',
  //       [productPayload.title],
  //     );
  //     const productID = result.rows[0]?.public_id;

  //     const response = await request(httpServer())
  //       .get(`/product/${productID}`)
  //       .set('x-user-id', userID);

  //     expect(response.status).toBe(200);
  //     expect(response.body.message).toBe('Produto encontrado com sucesso');
  //     expect(response.body.data?.title).toBe(productPayload.title);
  //   });
  // });

  // describe('PATCH /product/:id (3)', () => {
  //   it('should reject when x-user-id is missing', async () => {
  //     const productPayload = createProductPayload({
  //       title: `Produto E2E Patch Missing Header ${Date.now()}`,
  //     });

  //     await request(httpServer())
  //       .post('/product')
  //       .set('x-user-id', userID)
  //       .send(productPayload);

  //     const result = await client.query(
  //       'SELECT public_id FROM products WHERE title = $1 LIMIT 1',
  //       [productPayload.title],
  //     );
  //     const productID = result.rows[0]?.public_id;

  //     const response = await request(httpServer())
  //       .patch(`/product/${productID}`)
  //       .send({
  //         title: 'Produto atualizado e2e',
  //       });

  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //     expect(response.body.message).toBe('Header x-user-id é obrigatório');
  //     expect(response.body.data).toBe('x-user-id');
  //   });

  //   it('should reject when no update fields are provided', async () => {
  //     const productPayload = createProductPayload({
  //       title: `Produto E2E Patch Empty ${Date.now()}`,
  //     });

  //     await request(httpServer())
  //       .post('/product')
  //       .set('x-user-id', userID)
  //       .send(productPayload);

  //     const result = await client.query(
  //       'SELECT public_id FROM products WHERE title = $1 LIMIT 1',
  //       [productPayload.title],
  //     );
  //     const productID = result.rows[0]?.public_id;

  //     const response = await request(httpServer())
  //       .patch(`/product/${productID}`)
  //       .set('x-user-id', userID)
  //       .send({});

  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //     expect(response.body.message).toBe(
  //       'Adicione algum campo para o produto ser atualizado',
  //     );
  //     expect(response.body.data).toBe('all');
  //   });

  //   it('should update product successfully', async () => {
  //     const productPayload = createProductPayload({
  //       title: `Produto E2E Patch ${Date.now()}`,
  //     });

  //     await request(httpServer())
  //       .post('/product')
  //       .set('x-user-id', userID)
  //       .send(productPayload);

  //     const result = await client.query(
  //       'SELECT public_id FROM products WHERE title = $1 LIMIT 1',
  //       [productPayload.title],
  //     );
  //     const productID = result.rows[0]?.public_id;

  //     const response = await request(httpServer())
  //       .patch(`/product/${productID}`)
  //       .set('x-user-id', userID)
  //       .send({
  //         title: 'Produto atualizado e2e',
  //       });

  //     expect(response.status).toBe(200);
  //     expect(response.body.message).toBe('Produto atualizado com sucesso');
  //   });
  // });

  // describe('GET /product/filter (1)', () => {
  //   it('should reject when no filters are provided', async () => {
  //     const response = await request(httpServer()).get('/product/filter');

  //     expect(response.status).toBe(500);
  //     expect(response.body.message).toBe(
  //       'Adicione algum filtro para que possa filtrar produtos',
  //     );
  //   });
  // });
});
