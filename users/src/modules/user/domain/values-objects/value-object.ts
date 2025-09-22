export class ValueObject {
  protected value: any;

  public getValue() {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }
}
