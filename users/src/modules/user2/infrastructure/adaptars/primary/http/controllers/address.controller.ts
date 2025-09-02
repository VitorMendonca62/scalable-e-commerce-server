import {
  HttpResponseOutbound,
  HttpCreatedResponse,
  HttpOKResponse,
} from '@modules/user2/domain/ports/primary/http/sucess.port';
import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  Get,
  Delete,
  Controller,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AddUserAddressDTO } from '../dtos/add-user-address.dto';
import { AddUserAddressUseCase } from '@modules/user2/application/use-cases/add-user-address.usecase';
import { DeleteUserAddressUseCase } from '@modules/user2/application/use-cases/delete-user-address.usecase';
import { GetUserAddressUseCase } from '@modules/user2/application/use-cases/get-user-addresses.usecase';
import { AddressMapper } from '@modules/user2/infrastructure/mappers/address.mapper';

@Controller('/address')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class AddressController {
  constructor(
    private readonly addressMapper: AddressMapper,
    private readonly addUserAddressUseCase: AddUserAddressUseCase,
    private readonly getUserAddressUseCase: GetUserAddressUseCase,
    private readonly deleteUserAddressUseCase: DeleteUserAddressUseCase,
  ) {}

  // TODO pegar id do usuario de alguma forma
  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async addAddress(
    @Body() dto: AddUserAddressDTO,
  ): Promise<HttpResponseOutbound> {
    // TODO mockado useriD
    const address = this.addressMapper.addUserAddressDTOForEntity(dto, "20f4b8ce-c6a2-49c7-972b-5e969a29cea9");

    await this.addUserAddressUseCase.execute("20f4b8ce-c6a2-49c7-972b-5e969a29cea9", address);

    return new HttpCreatedResponse('Endereço criado com sucesso');
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getAddresses(): Promise<HttpResponseOutbound> {
    return new HttpOKResponse(
      'Aqui está todos os endereços do usuário',
      await this.getUserAddressUseCase.execute("20f4b8ce-c6a2-49c7-972b-5e969a29cea9"),
    );
  }

  @Delete(':addressId')
  @HttpCode(HttpStatus.OK)
  async updateAddress(
    @Param('addressId') addressId: number,
  ): Promise<HttpResponseOutbound> {
    return new HttpOKResponse(
      'Endereço deletado com sucesso.',
      await this.deleteUserAddressUseCase.execute("20f4b8ce-c6a2-49c7-972b-5e969a29cea9", addressId),
    );
  }
}
