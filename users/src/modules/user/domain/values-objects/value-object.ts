export class ValueObject {
  protected value: any;

  public getValue(): any {
    return this.value;
  }

  public toString(): string {
    return this.value == null || this.value == undefined
      ? this.value
      : String(this.value);
  }
}
