// Decorators
import { ApiEmail } from '../../common/decorators/docs/dtos/api-email.decorator';
import { ApiPassword } from '../../common/decorators/docs/dtos/api-password.decorator';

export class CreateUserDTO {
  userID: string;

  @ApiEmail(true)
  email: string;

  @ApiPassword(true)
  password: string;

  phonenumber: string;

  roles: string[];

  createdAt: Date;

  updatedAt: Date;
}
