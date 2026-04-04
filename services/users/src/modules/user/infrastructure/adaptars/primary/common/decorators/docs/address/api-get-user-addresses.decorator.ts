import { HttpResponseOutbound } from '@user/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  CityConstants,
  ComplementConstants,
  CountryConstants,
  NeighborhoodConstants,
  NumberConstants,
  PostalCodeConstants,
  StateConstants,
  StreetConstants,
} from '@user/domain/values-objects/address/constants';

export function ApiGetUserAddresses() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar endereços do usuário',
    }),
    ApiHeader({
      name: 'x-user-id',
      description: 'ID do usuário autenticado para listar endereços.',
      required: true,
    }),
    ApiOkResponse({
      description: 'Endereços encontrados com sucesso',
      example: {
        statusCode: HttpStatus.OK,
        message: 'Aqui está todos os endereços do usuário',
        data: [
          {
            addressId: 1,
            street: StreetConstants.EXEMPLE,
            number: NumberConstants.EXEMPLE,
            complement: ComplementConstants.EXEMPLE,
            neighborhood: NeighborhoodConstants.EXEMPLE,
            city: CityConstants.EXEMPLE,
            postalCode: PostalCodeConstants.EXEMPLE,
            state: StateConstants.EXEMPLE,
            country: CountryConstants.EXEMPLE,
          },
        ],
      },
      type: HttpResponseOutbound,
    }),
    ApiNotFoundResponse({
      description: 'Não foi possível encontrar os endereços do usuário',
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Não foi possível encontrar os endereços do usuário.',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
    ApiInternalServerErrorResponse({
      description: 'Não foi possivel buscar os endereços do usuário',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Não foi possivel buscar os endereços do usuário.',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
  );
}
