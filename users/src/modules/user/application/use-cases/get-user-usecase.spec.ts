import { UserRepository } from '@modules/user/domain/ports/secondary/user-repository.port';
import { GetUserUseCase } from './get-user.usecase';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { UsernameConstants } from '@modules/user/domain/values-objects/user/username/username-constants';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    userRepository = { findOne: jest.fn() } as any;
    useCase = new GetUserUseCase(userRepository);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = IDConstants.EXEMPLE;
    const username = UsernameConstants.EXEMPLE;

    
  });
});
