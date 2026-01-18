interface UserGoogle {
  id: string;
  displayName: string;
  name: { familyName: string; givenName: string };
  emails: { value: string; verified: boolean }[];
  photos: { value: string }[];
}

interface UserGoogleInCallBack {
  email: string;
  username: string;
  id: string;
  name: string;
}
