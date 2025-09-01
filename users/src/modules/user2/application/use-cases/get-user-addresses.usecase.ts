import { NotFoundItem as NotFoundItem } from '@modules/user2/domain/ports/primary/http/error.port';
import { AddressRepositoy } from '@modules/user2/domain/ports/secondary/address-repository.port';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';
import { AddressEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/address.entity';
import { Injectable } from '@nestjs/common';

type GetUserAddressUseCaseType = Partial<AddressEntity>;
@Injectable()
export class GetUserAddressUseCase {
  constructor(
    private readonly addressRepositoy: AddressRepositoy,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<GetUserAddressUseCaseType[]> {
    const user = await this.userRepository.findOne({ userId: userId });

    if (user == undefined || user == null) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    if (!user.active) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    const addresses = await this.addressRepositoy.getAll(userId);

    if (addresses.length == 0) {
      throw new NotFoundItem(
        'Não foi possível encontrar os endereços do usuário.',
      );
    }

    return addresses.map((address) => ({
      city: address.city,
      complement: address.complement,
      country: address.country,
      neighborhood: address.neighborhood,
      number: address.number,
      postalCode: address.postalCode,
      state: address.state,
      street: address.street,
    }));
  }
}
