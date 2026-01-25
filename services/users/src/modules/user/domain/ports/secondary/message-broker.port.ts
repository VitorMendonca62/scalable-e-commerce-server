export abstract class MessageBrokerService {
  abstract send(event: string, payload: any): void;
}
