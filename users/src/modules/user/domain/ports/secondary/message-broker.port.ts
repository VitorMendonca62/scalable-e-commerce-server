export abstract class MessageBroker {
  abstract send(event: string, payload: any): void;
}
