import { BrazilStates } from '@modules/user/domain/enums/brazil-ufs.enum';
import {
  ApiCity,
  ApiComplement,
  ApiCountry,
  ApiNeighborhood,
  ApiNumber,
  ApiPostalCode,
  ApiState,
  ApiStreet,
  City,
  Complement,
  Country,
  Neighborhood,
  PostalCode,
  State,
  Street,
  Number,
} from '../../common/decorators/dtos/address/decorators';

export class AddUserAddressDTO {
  @Street()
  @ApiStreet()
  street: string;

  @Number()
  @ApiNumber()
  number: string;

  @Complement()
  @ApiComplement()
  complement: string;

  @Neighborhood()
  @ApiNeighborhood()
  neighborhood: string;

  @City()
  @ApiCity()
  city: string;

  @PostalCode()
  @ApiPostalCode()
  postalCode: string;

  @State()
  @ApiState()
  state: BrazilStates;

  @Country()
  @ApiCountry()
  country: string;
}
