export abstract class PubSubMessageBroker {
  abstract publish(channel: string, value: object, service: string): void;
  abstract getChannel(channel: string, service: string): string;
}
