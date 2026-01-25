import {
  ApiEmail,
  Email,
} from '../../../common/decorators/dtos/user/decorators';

export class ValidateEmailDTO {
  @Email()
  @ApiEmail()
  email: string;
}
