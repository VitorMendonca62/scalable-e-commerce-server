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
import {
  BusinessRuleFailure,
  NotFoundItem,
  NotPossible,
} from '@user/domain/ports/primary/http/error.port';
import { FastifyReply } from 'fastify';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

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
  @ApiAddUserAddress()
  async addAddress(
    @Body() dto: AddUserAddressDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const address = this.addressMapper.addUserAddressDTOForEntity(dto, userID);

    const useCaseResult = await this.addUserAddressUseCase.execute(address);

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason === ApplicationResultReasons.NOT_POSSIBLE) {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR);
        return new NotPossible(useCaseResult.message);
      }
      response.status(HttpStatus.BAD_REQUEST);
      return new BusinessRuleFailure(useCaseResult.message);
    }

    response.status(HttpStatus.CREATED);
    return new HttpCreatedResponse('Endereço criado com sucesso');
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiGetUserAddresses()
  async getAll(
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.getUserAddressesUseCase.execute(userID);

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason === ApplicationResultReasons.NOT_POSSIBLE) {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR);
        return new NotPossible(useCaseResult.message);
      }
      response.status(HttpStatus.NOT_FOUND);
      return new NotFoundItem(useCaseResult.message);
    }
    return new HttpOKResponse(
      'Aqui está todos os endereços do usuário',
      useCaseResult.result,
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

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason === ApplicationResultReasons.NOT_POSSIBLE) {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR);
        return new NotPossible(useCaseResult.message);
      }
      response.status(HttpStatus.NOT_FOUND);
      return new NotFoundItem(useCaseResult.message);
    }

    return new HttpOKResponse('Endereço deletado com sucesso');
  }
}
