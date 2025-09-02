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
import { AuthorizationToken } from '../getValue/authorization-token.decorator';
import { IdInTokenPipe } from '@common/pipes/id-in-token.pipe';

@Controller('/address')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class AddressController {
  constructor(
    private readonly addressMapper: AddressMapper,
    private readonly addUserAddressUseCase: AddUserAddressUseCase,
    private readonly getUserAddressUseCase: GetUserAddressUseCase,
    private readonly deleteUserAddressUseCase: DeleteUserAddressUseCase,
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async addAddress(
    @Body() dto: AddUserAddressDTO,
    @AuthorizationToken('authorization', IdInTokenPipe)
    id: string,
  ): Promise<HttpResponseOutbound> {
    const address = this.addressMapper.addUserAddressDTOForEntity(dto, id);

    await this.addUserAddressUseCase.execute(id, address);

    return new HttpCreatedResponse('Endereço criado com sucesso');
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getAddresses(
    @AuthorizationToken('authorization', IdInTokenPipe)
    id: string,
  ): Promise<HttpResponseOutbound> {
    return new HttpOKResponse(
      'Aqui está todos os endereços do usuário',
      await this.getUserAddressUseCase.execute(id),
    );
  }

  @Delete(':addressId')
  @HttpCode(HttpStatus.OK)
  async updateAddress(
    @Param('addressId') addressId: number,
    @AuthorizationToken('authorization', IdInTokenPipe)
    id: string,
  ): Promise<HttpResponseOutbound> {
    return new HttpOKResponse(
      'Endereço deletado com sucesso.',
      await this.deleteUserAddressUseCase.execute(id, addressId),
    );
  }
}
