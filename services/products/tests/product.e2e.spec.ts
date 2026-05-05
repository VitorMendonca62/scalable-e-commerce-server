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

describe('ProductController (e2e)', () => {
  let app: NestFastifyApplication;
  const categoryID = v7();
  const categoryName = `Categoria E2E ${Date.now()}`;

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

    await app.get(CategoryRepository).create({
      name: categoryName,
      publicID: categoryID,
    });

    await client.connect();
  });

  const httpServer = () => app.getHttpServer();

  describe('POST /product', () => {
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
            expect(res.body.message).toBe(constants.ERROR_NUMBER);
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
            expect(res.body.message).toBe(constants.ERROR_NUMBER);
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

    it('should reject product with override publicID on payload', async () => {
      const payload = createProductPayload({ title: 'new title' });
      const newProductID = v7();

      const response = await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send({
          ...payload,
          publicID: newProductID,
          public_id: newProductID,
        });

      expect(response.body.message).toBe('property publicID should not exist');
    });

    it('should reject product with override createdAt on payload', async () => {
      const payload = createProductPayload({ title: 'new title' });
      const dateNow = new Date();

      const response = await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send({
          ...payload,
          createdAt: dateNow,
          created_at: dateNow,
        });

      expect(response.body.message).toBe('property createdAt should not exist');
    });

    it('should reject product with override updatedAt on payload', async () => {
      const payload = createProductPayload({ title: 'new title' });
      const dateNow = new Date();

      const response = await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send({
          ...payload,
          updatedAt: dateNow,
          updated_at: dateNow,
        });

      expect(response.body.message).toBe('property updatedAt should not exist');
    });

    it('should reject product with override rating on payload', async () => {
      const payload = createProductPayload({ title: 'new title' });

      const response = await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send({
          ...payload,
          rating: 5,
        });

      expect(response.body.message).toBe('property rating should not exist');
    });
  });

  describe('GET /product/:id (3)', () => {
    let productID: string;
    let productCreatedAt: string;
    let productUpdatedAt: string;

    const productPayload = createProductPayload({
      title: `Produto E2E Missing Header ${Date.now()}`,
    });

    beforeAll(async () => {
      await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send(productPayload)
        .expect(HttpStatus.CREATED);

      const result = await client.query(
        'SELECT * FROM products WHERE title = $1 LIMIT 1',
        [productPayload.title],
      );

      productID = result.rows[0]?.public_id;
      productCreatedAt = result.rows[0]?.created_at.toISOString();

      productUpdatedAt = result.rows[0]?.updated_at.toISOString();
    });

    it('should reject when x-user-id is missing', async () => {
      const response = await request(httpServer()).get(`/product/${productID}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('Header x-user-id é obrigatório');
      expect(response.body.data).toBe('x-user-id');
    });

    it('should return not found for unknown product', async () => {
      const response = await request(httpServer())
        .get('/product/00000000-0000-0000-0000-000000000000')
        .set('x-user-id', userID);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe(
        'Não foi possivel encontrar o produto',
      );
    });

    it('should return product by id', async () => {
      const response = await request(httpServer())
        .get(`/product/${productID}`)
        .set('x-user-id', userID);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Produto encontrado com sucesso');

      expect(response.body.data).toEqual({
        createdAt: productCreatedAt,
        updatedAt: productUpdatedAt,
        category: {
          name: categoryName,
          publicID: categoryID,
        },
        description: productPayload.description,
        isFavorited: false,
        overview: productPayload.overview,
        owner: userID,
        payments: productPayload.payments,
        photos: productPayload.photos,
        price: productPayload.price,
        publicID: productID,
        rating: 0,
        stock: productPayload.stock,
        title: productPayload.title,
      });
    });
  });

  describe('PATCH /product/:id', () => {
    let productID: string;

    beforeEach(async () => {
      const payload = createProductPayload({
        title: `Produto PATCH ${Date.now()}`,
      });

      await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send(payload)
        .expect(HttpStatus.CREATED);

      const result = await client.query(
        'SELECT * FROM products WHERE title = $1 LIMIT 1',
        [payload.title],
      );
      productID = result.rows[0].public_id;
    });

    describe('reject title', () => {
      const constants = TitleConstants;
      const key = 'title';

      it('should reject when key is not string', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_STRING_EXEMPLE,
        });

        return request(httpServer())
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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

      it('should reject when key is not integer', async () => {
        await request(httpServer())
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
          .set('x-user-id', userID)
          .send(
            createProductPayload({
              [key]: NaN,
            }),
          )
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_NUMBER);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });

        await request(httpServer())
          .patch(`/product/${productID}`)
          .set('x-user-id', userID)
          .send(
            createProductPayload({
              [key]: Infinity,
            }),
          )
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(constants.ERROR_NUMBER);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe(key);
          });
      });

      it('should reject when key is not number', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_NUMBER_EXEMPLE,
        });

        await request(httpServer())
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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

      it('should reject when key is not string', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_STRING_EXEMPLE,
        });

        return request(httpServer())
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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

      it('should reject when key is not string', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_STRING_EXEMPLE,
        });

        return request(httpServer())
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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

      it('should reject when key is not array', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_ARRAY_EXEMPLE,
        });

        return request(httpServer())
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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

      it('should reject when key is not array', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_ARRAY_EXEMPLE,
        });

        return request(httpServer())
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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

      it('should reject when key is not boolean', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_BOOLEAN_EXEMPLE,
        });

        return request(httpServer())
          .patch(`/product/${productID}`)
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

      it('should reject when key is not number', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_NUMBER_EXEMPLE,
        });

        return request(httpServer())
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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

      it('should reject when key is not string', async () => {
        const payload = createProductPayload({
          [key]: constants.ERROR_STRING_EXEMPLE,
        });

        return request(httpServer())
          .patch(`/product/${productID}`)
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
          .patch(`/product/${productID}`)
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
        .patch(`/product/${productID}`)
        .send({ title: 'any-title' });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('Header x-user-id é obrigatório');
      expect(response.body.data).toBe('x-user-id');
    });

    it('should reject when body is empty', async () => {
      const response = await request(httpServer())
        .patch(`/product/${productID}`)
        .set('x-user-id', userID)
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe(
        'Adicione algum campo para o produto ser atualizado',
      );
      expect(response.body.data).toBe('all');
    });

    it('should return not found for unknown product', async () => {
      const response = await request(httpServer())
        .patch('/product/00000000-0000-0000-0000-000000000000')
        .set('x-user-id', userID)
        .send({ title: 'Produto inexistente' });

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe(
        'Não foi possivel encontrar o produto',
      );
    });

    it('should update product with partial payload', async () => {
      const createPayload = createProductPayload({
        title: `Produto PATCH - Success ${Date.now()}`,
      });

      await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send(createPayload)
        .expect(HttpStatus.CREATED);

      const createResult = await client.query(
        'SELECT * FROM products WHERE title = $1 LIMIT 1',
        [createPayload.title],
      );
      const productID = createResult.rows[0].public_id;
      const originalProduct = createResult.rows[0];

      const payload = {
        title: `Produto atualizado ${Date.now()}`,
        price: 2999,
      };

      const response = await request(httpServer())
        .patch(`/product/${productID}`)
        .set('x-user-id', userID)
        .send(payload);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Produto atualizado com sucesso');

      const result = await client.query(
        'SELECT * FROM products WHERE public_id = $1 LIMIT 1',
        [productID],
      );

      const updatedProduct = result.rows[0];

      expect(updatedProduct.title).toBe(payload.title);
      expect(updatedProduct.price).toBe(payload.price);
      expect(updatedProduct.description).toBe(originalProduct.description);
    });

    it('should update product with new category ', async () => {
      const dateNow = Date.now();

      const categoryID = v7();
      const categoryName = `Categoria Patch E2E ${dateNow}`;

      await app.get(CategoryRepository).create({
        name: categoryName,
        publicID: categoryID,
      });

      const createPayload = createProductPayload({
        title: `Produto PATCH - Success New Category ${dateNow}`,
      });

      await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send(createPayload)
        .expect(HttpStatus.CREATED);

      const createResult = await client.query(
        'SELECT * FROM products WHERE title = $1 LIMIT 1',
        [createPayload.title],
      );
      const productID = createResult.rows[0].public_id;
      const originalProduct = createResult.rows[0];

      const payload = {
        categoryID,
      };

      const response = await request(httpServer())
        .patch(`/product/${productID}`)
        .set('x-user-id', userID)
        .send(payload);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Produto atualizado com sucesso');

      const result = await client.query(
        'SELECT * FROM products WHERE public_id = $1 LIMIT 1',
        [productID],
      );

      const updatedProduct = result.rows[0];

      expect(updatedProduct.category_id).toBe(payload.categoryID);
      expect(updatedProduct.description).toBe(originalProduct.description);
    });

     it('should change updatedAt on product with change any product field  ', async () => {
      const createPayload = createProductPayload({
        title: `Produto PATCH - Success New Category ${Date.now()}`,
      });

      await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send(createPayload)
        .expect(HttpStatus.CREATED);

      const createResult = await client.query(
        'SELECT * FROM products WHERE title = $1 LIMIT 1',
        [createPayload.title],
      );
      const productID = createResult.rows[0].public_id;
      const originalProduct = createResult.rows[0];

      const payload = {
        title: `New title -${Date.now()}`,
      };

      const response = await request(httpServer())
        .patch(`/product/${productID}`)
        .set('x-user-id', userID)
        .send(payload);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toBe('Produto atualizado com sucesso');

      const result = await client.query(
        'SELECT * FROM products WHERE public_id = $1 LIMIT 1',
        [productID],
      );

      const updatedProduct = result.rows[0];

      expect(updatedProduct.updated_at).not.toBe(originalProduct.updated_at);
    });

    it('should reject when category not already exists', async () => {
      const response = await request(httpServer())
        .patch(`/product/${productID}`)
        .set('x-user-id', userID)
        .send({ categoryID: v7() });

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(
        'Não foi possivel atualizar o produto',
      );
      expect(response.body.data).toBeUndefined();
    });

    it('should handle concurrent product update', async () => {
      const createPayload = createProductPayload({
        title: `Produto PATCH - Concurrent ${Date.now()}`,
      });

      await request(httpServer())
        .post('/product')
        .set('x-user-id', userID)
        .send(createPayload)
        .expect(HttpStatus.CREATED);

      const createResult = await client.query(
        'SELECT * FROM products WHERE title = $1 LIMIT 1',
        [createPayload.title],
      );
      const productID = createResult.rows[0].public_id;

      const requests = Array.from({ length: 5 }, (_, index) =>
        request(httpServer())
          .patch(`/product/${productID}`)
          .set('x-user-id', userID)
          .send({ title: `only-title-${index}` }),
      );

      const responses = await Promise.all(requests);

      const created = responses.filter(
        (response) => response.status === HttpStatus.OK,
      );
      const rejected = responses.filter(
        (response) => response.status !== HttpStatus.OK,
      );

      expect(created).toHaveLength(5);
      expect(rejected).toHaveLength(0);
    });

    it('should reject product with override owner on payload', async () => {
      const payload = { title: 'new title' };
      const newUserID = v7();

      const response = await request(httpServer())
        .patch(`/product/${productID}`)
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

    it('should reject product with override publicID on payload', async () => {
      const payload = { title: 'new title' };
      const newProductID = v7();

      const response = await request(httpServer())
        .patch(`/product/${productID}`)

        .set('x-user-id', userID)
        .send({
          ...payload,
          publicID: newProductID,
          public_id: newProductID,
        });

      expect(response.body.message).toBe('property publicID should not exist');
    });

    it('should reject product with override createdAt on payload', async () => {
      const payload = { title: 'new title' };
      const dateNow = new Date();

      const response = await request(httpServer())
        .patch(`/product/${productID}`)
        .set('x-user-id', userID)
        .send({
          ...payload,
          createdAt: dateNow,
          created_at: dateNow,
        });

      expect(response.body.message).toBe('property createdAt should not exist');
    });

    it('should reject product with override updatedAt on payload', async () => {
      const payload = { title: 'new title' };
      const dateNow = new Date();

      const response = await request(httpServer())
        .patch(`/product/${productID}`)
        .set('x-user-id', userID)
        .send({
          ...payload,
          updatedAt: dateNow,
          updated_at: dateNow,
        });

      expect(response.body.message).toBe('property updatedAt should not exist');
    });

    it('should reject product with override rating on payload', async () => {
      const payload = { title: 'new title' };

      const response = await request(httpServer())
        .patch(`/product/${productID}`)
        .set('x-user-id', userID)
        .send({
          ...payload,
          rating: 5,
        });

      expect(response.body.message).toBe('property rating should not exist');
    });
  });
});
