export class TokenModel {
  token: string;
  userID: string;
  ip: string;
  lastAccess: string;
  createdAt: string;

  constructor(props: {
    token: string;
    userID: string;
    ip: string;
    lastAccess: string;
    createdAt: string;
  }) {
    this.token = props.token;
    this.userID = props.userID;
    this.ip = props.ip;
    this.lastAccess = props.lastAccess;
    this.createdAt = props.createdAt;
  }
}
