import { Street } from '../../common/decorators/dtos/address/street.decorator';
import { ApiStreet } from '../../common/decorators/docs/dtos/address/api-street.decorator';
import { Complement } from '../../common/decorators/dtos/address/complement.decorator';
import { ApiComplement } from '../../common/decorators/docs/dtos/address/api-complement.decorator';
import { Neighborhood } from '../../common/decorators/dtos/address/neighborhood.decorator';
import { ApiNeighborhood } from '../../common/decorators/docs/dtos/address/api-neighborhood.decorator';
import { City } from '../../common/decorators/dtos/address/city.decorator';
import { ApiCity } from '../../common/decorators/docs/dtos/address/api-city.decorator';
import { PostalCode } from '../../common/decorators/dtos/address/postal-code.decorator';
import { ApiPostalCode } from '../../common/decorators/docs/dtos/address/api-postal-code.decorator';
import { State } from '../../common/decorators/dtos/address/state.decorator';
import { ApiState } from '../../common/decorators/docs/dtos/address/api-state.decorator';
import { Country } from '../../common/decorators/dtos/address/country.decorator';
import { ApiCountry } from '../../common/decorators/docs/dtos/address/api-country.decorator';
import { Number } from '../../common/decorators/dtos/address/number.decorator';
import { ApiNumber } from '../../common/decorators/docs/dtos/address/api-number.decorator';

export class AddUserAddressDTO {
  @Street(true)
  @ApiStreet(true)
  street: string;

  @Number(true)
  @ApiNumber(true)
  number: string;

  @Complement()
  @ApiComplement()
  complement: string;

  @Neighborhood(true)
  @ApiNeighborhood(true)
  neighborhood: string;

  @City(true)
  @ApiCity(true)
  city: string;

  @PostalCode(true)
  @ApiPostalCode(true)
  postalCode: string;

  @State(true)
  @ApiState(true)
  state: string;

  @Country(true)
  @ApiCountry(true)
  country: string;
}
