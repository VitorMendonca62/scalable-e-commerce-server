import { Test, TestingModule } from '@nestjs/testing';
import { MongooseUserRepository } from './mongoose-user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@modules/auth/infrastructure/mappers/user.mapper';

describe('MongooseService', () => {
  let service: MongooseUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/auth_users'),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
      providers: [
        UserMapper,
        {
          provide: UserRepository,
          useClass: MongooseUserRepository,
        },
      ],
    }).compile();

    service = module.get<MongooseUserRepository>(MongooseUserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
