import { Injectable } from '@nestjs/common';
import { User } from '../../domain/user.entity';
import { CreateUserPort } from '../ports/user.port';

@Injectable()
export class CreateUserUseCase implements CreateUserPort {
  execute(user: User): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
