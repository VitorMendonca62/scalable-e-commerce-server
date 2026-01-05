export interface UserInRefreshToken {
  userID: string;
  tokenID: string;
}

export interface UserInResetPassToken {
  email: string;
}

export interface UserInAcessToken {
  userID: string;
}
