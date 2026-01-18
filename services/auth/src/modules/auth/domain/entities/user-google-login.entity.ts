import EmailVO from '../values-objects/email/email-vo';

export class UserGoogleLogin {
  email: EmailVO;
  name: string;
  id: string;
  ip: string;

  constructor(props: { email: EmailVO; name: string; id: string; ip: string }) {
    this.email = props.email;
    this.name = props.name;
    this.id = props.id;
    this.ip = props.ip;
  }
}
