import { Address } from '@user/domain/entities/address.entity';
import { CreateUserAddressPort as AddUserAddressPort } from '@modules/user2/domain/ports/primary/user.port';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { NotFoundUser } from '@modules/user2/domain/ports/primary/http/error.port';
import { AddressService } from '@modules/user2/infrastructure/adaptars/secondary/address/address.service';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { BrasilAPICEPError } from '@modules/user2/domain/ports/secondary/address-service.port';

@Injectable()
export class AddUserAddressUseCase implements AddUserAddressPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly addressService: AddressService,
  ) {}

  async execute(userId: string, newAddress: Address): Promise<void> {
    const user = await this.userRepository.findOne({ userId: userId });

    if (user == undefined || user == null) {
      throw new NotFoundUser();
    }

    if (!user.active) {
      throw new NotFoundUser();
    }

    const cepInfo = firstValueFrom(
      this.addressService.searchCEP(newAddress.postalCode.getValue()),
    ).catch((error: AxiosError<BrasilAPICEPError>) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });

    console.log(await cepInfo)
  }
}
