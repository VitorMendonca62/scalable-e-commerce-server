export abstract class MessageBroker {
  abstract send(
    event: string,
    payload: object,
    isNewEvent: boolean,
  ): Promise<boolean>;
}
