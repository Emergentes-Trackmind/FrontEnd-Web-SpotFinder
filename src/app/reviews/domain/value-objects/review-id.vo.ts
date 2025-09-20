export class ReviewId {
  private readonly _value: string;

  constructor(value: string | number) {
    if (value === null || value === undefined) {
      throw new Error('ReviewId cannot be null or undefined');
    }

    const stringValue = String(value).trim();

    if (stringValue.length === 0) {
      throw new Error('ReviewId cannot be empty');
    }

    this._value = stringValue;
  }

  get value(): string {
    return this._value;
  }

  equals(other: ReviewId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(value: string | number): ReviewId {
    return new ReviewId(value);
  }

  static fromString(value: string): ReviewId {
    return new ReviewId(value);
  }

  static fromNumber(value: number): ReviewId {
    return new ReviewId(value);
  }

  // Para uso con formularios y APIs
  toJSON(): string {
    return this._value;
  }

  // Validación estática
  static isValid(value: string | number): boolean {
    try {
      new ReviewId(value);
      return true;
    } catch {
      return false;
    }
  }
}
