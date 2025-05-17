export abstract class PubSubMessageBroker {
  abstract publish(
    channel: string,
    value: object,
    service: string | null,
  ): void;
  abstract getChannel(channel: string, service: string | null): string;
}
