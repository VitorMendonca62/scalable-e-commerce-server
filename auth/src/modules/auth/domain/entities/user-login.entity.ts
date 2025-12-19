import EmailVO from '../values-objects/email/email-vo';
import PasswordVO from '../values-objects/password/password-vo';

export class UserLogin {
  email: EmailVO;
  password: PasswordVO;
  ip: string;

  constructor(props: { email: EmailVO; password: PasswordVO; ip: string }) {
    this.email = props.email;
    this.password = props.password;
    this.ip = props.ip;
  }
}
