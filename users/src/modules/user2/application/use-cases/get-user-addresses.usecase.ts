import { NotFoundItem as NotFoundItem } from '@modules/user2/domain/ports/primary/http/error.port';
import { AddressRepositoy } from '@modules/user2/domain/ports/secondary/address-repository.port';
import { AddressEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/address.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetUserAddressUseCase{
  constructor(
    private readonly addressRepositoy: AddressRepositoy,
  ) {}

  async execute(userId: string): Promise<AddressEntity[]> {
    const address = await this.addressRepositoy.getAll(userId);

    if(address.length == 0) {
      throw new NotFoundItem('Não foi possível encontrar os endereços do usuário.');
    }

    return address;
  }
}
