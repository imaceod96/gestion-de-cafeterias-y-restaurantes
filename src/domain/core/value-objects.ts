import { Money, Quantity, ISODateTime, ID } from "./types";

export class Price {
  private constructor(
    public readonly amount: Money,
    public readonly currency: string = "MXN"
  ) {
    if (amount < 0) {
      throw new Error("Price cannot be negative");
    }
  }

  static create(amount: Money, currency: string = "MXN"): Price {
    return new Price(amount, currency);
  }

  static zero(currency: string = "MXN"): Price {
    return new Price(0, currency);
  }

  add(other: Price): Price {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add prices with different currencies");
    }
    return new Price(this.amount + other.amount, this.currency);
  }

  subtract(other: Price): Price {
    if (this.currency !== other.currency) {
      throw new Error("Cannot subtract prices with different currencies");
    }
    return new Price(this.amount - other.amount, this.currency);
  }

  multiply(qty: Quantity): Price {
    return new Price(this.amount * qty, this.currency);
  }

  equals(other: Price): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  toNumber(): number {
    return this.amount;
  }
}

export class StockQuantity {
  private constructor(public readonly value: Quantity) {
    if (value < 0) {
      throw new Error("Stock quantity cannot be negative");
    }
  }

  static create(value: Quantity): StockQuantity {
    return new StockQuantity(value);
  }

  static zero(): StockQuantity {
    return new StockQuantity(0);
  }

  add(other: StockQuantity): StockQuantity {
    return new StockQuantity(this.value + other.value);
  }

  subtract(other: StockQuantity): StockQuantity {
    const result = this.value - other.value;
    if (result < 0) {
      throw new Error("Insufficient stock");
    }
    return new StockQuantity(result);
  }

  equals(other: StockQuantity): boolean {
    return this.value === other.value;
  }

  isZero(): boolean {
    return this.value === 0;
  }

  toNumber(): number {
    return this.value;
  }
}

export class Percentage {
  private constructor(public readonly value: number) {
    if (value < 0 || value > 100) {
      throw new Error("Percentage must be between 0 and 100");
    }
  }

  static create(value: number): Percentage {
    return new Percentage(value);
  }

  static zero(): Percentage {
    return new Percentage(0);
  }

  toNumber(): number {
    return this.value;
  }

  toString(): string {
    return `${this.value.toFixed(2)}%`;
  }
}

export class ProfitMargin {
  private constructor(
    public readonly amount: Price,
    public readonly percentage: Percentage
  ) {}

  static calculate(salePrice: Price, costPrice: Price): ProfitMargin {
    const amount = salePrice.subtract(costPrice);
    const percentageValue =
      costPrice.amount > 0
        ? ((salePrice.amount / costPrice.amount) * 100 - 100)
        : 0;
    const percentage = Percentage.create(Math.max(0, percentageValue));
    return new ProfitMargin(amount, percentage);
  }

  static zero(currency: string = "MXN"): ProfitMargin {
    return new ProfitMargin(Price.zero(currency), Percentage.zero());
  }
}

export class Timestamp {
  private constructor(public readonly value: ISODateTime) {}

  static now(): Timestamp {
    return new Timestamp(new Date().toISOString());
  }

  static fromISOString(isoString: string): Timestamp {
    return new Timestamp(isoString);
  }

  toISOString(): string {
    return this.value;
  }

  toDate(): Date {
    return new Date(this.value);
  }

  equals(other: Timestamp): boolean {
    return this.value === other.value;
  }

  isBefore(other: Timestamp): boolean {
    return this.value < other.value;
  }

  isAfter(other: Timestamp): boolean {
    return this.value > other.value;
  }
}

export class EntityId {
  private constructor(public readonly value: ID) {
    if (!value || value.trim() === "") {
      throw new Error("Entity ID cannot be empty");
    }
  }

  static create(value: ID): EntityId {
    return new EntityId(value);
  }

  static generate(): EntityId {
    return new EntityId(crypto.randomUUID());
  }

  equals(other: EntityId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}