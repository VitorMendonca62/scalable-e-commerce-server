export abstract class EmailSender {
  abstract send(
    to: string,
    from: string,
    subject: string,
    template: string,
    context: { [key: string]: string },
  );
}
