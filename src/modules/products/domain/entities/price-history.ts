import { EntityId, Timestamp, Price } from "../../../../shared/domain/value-objects";
import { ID, PriceType } from "../../../../shared/types";

export interface PriceHistoryData {
  id: ID;
  productId: ID;
  priceType: PriceType;
  oldPrice: number | null;
  newPrice: number;
  changedBy: string | null;
  changeDate: string;
  createdAt: string;
}

export class PriceHistory {
  public readonly id: EntityId;
  public readonly productId: EntityId;
  public readonly priceType: PriceType;
  public readonly oldPrice: Price | null;
  public readonly newPrice: Price;
  public readonly changedBy: string | null;
  public readonly changeDate: Timestamp;
  public readonly createdAt: Timestamp;

  private constructor(data: PriceHistoryData) {
    this.id = EntityId.create(data.id);
    this.productId = EntityId.create(data.productId);
    this.priceType = data.priceType;
    this.oldPrice = data.oldPrice === null ? null : Price.create(data.oldPrice);
    this.newPrice = Price.create(data.newPrice);
    this.changedBy = data.changedBy;
    this.changeDate = Timestamp.fromISOString(data.changeDate);
    this.createdAt = Timestamp.fromISOString(data.createdAt);
  }

  static create(data: {
    id?: ID;
    productId: ID;
    priceType: PriceType;
    oldPrice?: number | null;
    newPrice: number;
    changedBy?: string | null;
    changeDate?: string;
    createdAt?: string;
  }): PriceHistory {
    const now = Timestamp.now().toISOString();
    return new PriceHistory({
      id: data.id ?? EntityId.generate().toString(),
      productId: data.productId,
      priceType: data.priceType,
      oldPrice: data.oldPrice ?? null,
      newPrice: data.newPrice,
      changedBy: data.changedBy ?? null,
      changeDate: data.changeDate ?? now,
      createdAt: data.createdAt ?? now,
    });
  }

  static fromData(data: PriceHistoryData): PriceHistory {
    return new PriceHistory(data);
  }

  toData(): PriceHistoryData {
    return {
      id: this.id.toString(),
      productId: this.productId.toString(),
      priceType: this.priceType,
      oldPrice: this.oldPrice ? this.oldPrice.toNumber() : null,
      newPrice: this.newPrice.toNumber(),
      changedBy: this.changedBy,
      changeDate: this.changeDate.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}
