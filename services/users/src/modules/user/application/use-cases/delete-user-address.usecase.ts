import { Injectable } from '@nestjs/common';
import { UserRepository } from '@user/domain/ports/secondary/user-repository.port';
import { NotFoundItem } from '@user/domain/ports/primary/http/error.port';
import { AddressRepositoy } from '@user/domain/ports/secondary/address-repository.port';

@Injectable()
export class DeleteUserAddressUseCase {
  constructor(
    private readonly addressRepository: AddressRepositoy,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(addressIndex: number, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ userId: userId });

    if (user == undefined || user == null) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    if (!user.active) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    const addresses = await this.addressRepository.getAll(userId);

    if (addressIndex >= addresses.length) {
      throw new NotFoundItem('Não foi possivel encontrar o endereço');
    }

    await this.addressRepository.delete(userId, addressIndex);
  }
}
