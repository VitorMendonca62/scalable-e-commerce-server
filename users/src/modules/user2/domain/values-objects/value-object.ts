export class ValueObject {
  protected value: any;

  public getValue(): any {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }
}
