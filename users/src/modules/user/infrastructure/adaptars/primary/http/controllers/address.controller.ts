import {
  HttpResponseOutbound,
  HttpCreatedResponse,
  HttpOKResponse,
  HttpDeletedResponse,
} from '@user/domain/ports/primary/http/sucess.port';
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
import { AddUserAddressUseCase } from '@user/application/use-cases/add-user-address.usecase';
import { DeleteUserAddressUseCase } from '@user/application/use-cases/delete-user-address.usecase';
import { GetUserAddressUseCase as GetUserAddressesUseCase } from '@user/application/use-cases/get-user-addresses.usecase';
import { AddressMapper } from '@user/infrastructure/mappers/address.mapper';
import { AuthorizationToken } from '../getValue/authorization-token.decorator';
import { IdInTokenPipe } from '@common/pipes/id-in-token.pipe';

@Controller('/address')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class AddressController {
  constructor(
    private readonly addressMapper: AddressMapper,
    private readonly addUserAddressUseCase: AddUserAddressUseCase,
    private readonly getUserAddressesUseCase: GetUserAddressesUseCase,
    private readonly deleteUserAddressUseCase: DeleteUserAddressUseCase,
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body() dto: AddUserAddressDTO,
    @AuthorizationToken('authorization', IdInTokenPipe)
    id: string,
  ): Promise<HttpResponseOutbound> {
    const address = this.addressMapper.addUserAddressDTOForModel(dto, id);

    return new HttpCreatedResponse(
      'Endereço criado com sucesso',
      await this.addUserAddressUseCase.execute(id, address),
    );
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getAll(
    @AuthorizationToken('authorization', IdInTokenPipe)
    id: string,
  ): Promise<HttpResponseOutbound> {
    return new HttpOKResponse(
      'Aqui está todos os endereços do usuário',
      await this.getUserAddressesUseCase.execute(id),
    );
  }

  @Delete(':addressId')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('addressId') addressId: number,
    @AuthorizationToken('authorization', IdInTokenPipe)
    id: string,
  ): Promise<HttpResponseOutbound> {
    return new HttpDeletedResponse(
      'Endereço deletado com sucesso',
      await this.deleteUserAddressUseCase.execute(addressId, id),
    );
  }
}
