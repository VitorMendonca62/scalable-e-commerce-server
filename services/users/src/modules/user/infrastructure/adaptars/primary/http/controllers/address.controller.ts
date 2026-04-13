import {
  HttpResponseOutbound,
  HttpCreatedResponse,
  HttpOKResponse,
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
  Headers,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { AddressMapper } from '@user/infrastructure/mappers/address.mapper';
import {
  AddUserAddressUseCase,
  DeleteUserAddressUseCase,
  GetUserAddressesUseCase,
} from '@user/application/use-cases/address/use-cases';
import { AddUserAddressDTO } from '../dtos/add-user-address.dto';
import {
  ApiAddUserAddress,
  ApiDeleteUserAddress,
  ApiGetUserAddresses,
} from '../../common/decorators/docs/address/decorators';
import { FastifyReply } from 'fastify';
import UseCaseResultToHttpMapper from '@user/infrastructure/mappers/use-case-result-to-http.mapper';

@Controller('/address')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class AddressController {
  constructor(
    private readonly addressMapper: AddressMapper,
    private readonly useCaseResultToHttpMapper: UseCaseResultToHttpMapper,
    private readonly addUserAddressUseCase: AddUserAddressUseCase,
    private readonly getUserAddressesUseCase: GetUserAddressesUseCase,
    private readonly deleteUserAddressUseCase: DeleteUserAddressUseCase,
  ) {}

  @Post('/')
  @ApiAddUserAddress()
  async addAddress(
    @Body() dto: AddUserAddressDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const address = this.addressMapper.addUserAddressDTOForEntity(dto, userID);

    const useCaseResult = await this.addUserAddressUseCase.execute(address);

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpCreatedResponse('Endereço criado com sucesso'),
      response,
    );
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiGetUserAddresses()
  async getAll(
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.getUserAddressesUseCase.execute(userID);

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse(
        'Aqui está todos os endereços do usuário',
        useCaseResult.ok ? useCaseResult.result : [],
      ),
      response,
    );
  }

  @Delete(':addressId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteUserAddress()
  async delete(
    @Param('addressId') addressId: number,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.deleteUserAddressUseCase.execute(
      addressId,
      userID,
    );

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse('Endereço deletado com sucesso'),
      response,
    );
  }
}
