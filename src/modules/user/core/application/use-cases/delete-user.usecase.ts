import { DeleteUserPort } from '../ports/user.port';

export class DeleteUserUseCase implements DeleteUserPort {
  execute(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
