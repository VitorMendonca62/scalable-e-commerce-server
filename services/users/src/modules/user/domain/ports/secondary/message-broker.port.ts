import { PermissionsSystem } from '../../types/permissions';

export abstract class MessageBroker {
  abstract send(
    event: string,
    payload: object,
    isNewEvent: boolean,
  ): Promise<boolean>;
}

export interface UserOutboundMessageBroker {
  userID: string;
  email: string;
  password: string;
  roles: PermissionsSystem[];
  createdAt: Date;
  updatedAt: Date;
}
