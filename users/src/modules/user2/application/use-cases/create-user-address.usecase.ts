import { Address } from '@user/domain/entities/address.entity';
import { CreateUserAddressPort } from '@modules/user2/domain/ports/primary/user.port';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { NotFoundUser } from '@modules/user2/domain/ports/primary/http/error.port';
import { AddressService } from '@modules/user2/infrastructure/adaptars/secondary/address/address.service';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { BrasilAPICEPError } from '@modules/user2/domain/ports/secondary/address-service';

@Injectable()
export class CreateUserAddressUseCase implements CreateUserAddressPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly addressService: AddressService,
  ) {}

  async execute(id: string, newAddress: Address): Promise<void> {
    const userExists = await this.userRepository.findOne({ id });

    if (userExists == undefined) {
      throw new NotFoundUser();
    }

    const cepInfo = firstValueFrom(
      this.addressService.searchCEP(newAddress.postalCode),
    ).catch((error: AxiosError<BrasilAPICEPError>) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
  }
}
