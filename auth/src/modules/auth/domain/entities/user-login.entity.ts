import EmailVO from '../values-objects/email.vo';
import PasswordVO from '../values-objects/password.vo';

export class UserLogin {
  email: EmailVO;
  password: PasswordVO;
  accessedAt: Date;

  constructor(props: {
    email: EmailVO;
    password: PasswordVO;
    accessedAt: Date;
  }) {
    this.email = props.email;
    this.password = props.password;
    this.accessedAt = props.accessedAt ?? new Date();
  }
}
