export type AddressRecord = {
  id: number;
  userID: string;
  street: string;
  number: string;
  complement: string | undefined | null;
  neighborhood: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  createdAt: Date;
};
