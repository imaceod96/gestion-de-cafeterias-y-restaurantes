import { EntityId, Timestamp, Price, StockQuantity } from "../../../../shared/domain/value-objects";
import { ID, SaleOrigin } from "../../../../shared/types";

export interface SaleDetailData {
  id: ID;
  saleId: ID;
  productId: ID;
  productName: string;
  quantity: number;
  unitSalePrice: number;
  unitCost: number;
  total: number;
  createdAt: string;
}

export class SaleDetail {
  public readonly id: EntityId;
  public readonly saleId: EntityId;
  public readonly productId: EntityId;
  public readonly productName: string;
  public readonly quantity: StockQuantity;
  public readonly unitSalePrice: Price;
  public readonly unitCost: Price;
  public readonly total: Price;
  public readonly createdAt: Timestamp;

  private constructor(data: SaleDetailData) {
    this.id = EntityId.create(data.id);
    this.saleId = EntityId.create(data.saleId);
    this.productId = EntityId.create(data.productId);
    this.productName = data.productName;
    this.quantity = StockQuantity.create(data.quantity);
    this.unitSalePrice = Price.create(data.unitSalePrice);
    this.unitCost = Price.create(data.unitCost);
    this.total = Price.create(data.total);
    this.createdAt = Timestamp.fromISOString(data.createdAt);
  }

  static create(data: {
    id?: ID;
    saleId: ID;
    productId: ID;
    productName: string;
    quantity: number;
    unitSalePrice: number;
    unitCost: number;
    total?: number;
    createdAt?: string;
  }): SaleDetail {
    const now = Timestamp.now().toISOString();
    const total = data.total ?? data.quantity * data.unitSalePrice;
    return new SaleDetail({
      id: data.id ?? EntityId.generate().toString(),
      saleId: data.saleId,
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      unitSalePrice: data.unitSalePrice,
      unitCost: data.unitCost,
      total,
      createdAt: data.createdAt ?? now,
    });
  }

  static fromData(data: SaleDetailData): SaleDetail {
    return new SaleDetail(data);
  }

  toData(): SaleDetailData {
    return {
      id: this.id.toString(),
      saleId: this.saleId.toString(),
      productId: this.productId.toString(),
      productName: this.productName,
      quantity: this.quantity.toNumber(),
      unitSalePrice: this.unitSalePrice.toNumber(),
      unitCost: this.unitCost.toNumber(),
      total: this.total.toNumber(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}

export interface SaleData {
  id: ID;
  origin: SaleOrigin;
  originId: string | null;
  total: number;
  totalCost: number;
  totalProfit: number;
  itemCount: number;
  saleDate: string;
  createdAt: string;
}

export class Sale {
  public readonly id: EntityId;
  public readonly origin: SaleOrigin;
  public readonly originId: string | null;
  public readonly total: Price;
  public readonly totalCost: Price;
  public readonly totalProfit: Price;
  public readonly itemCount: number;
  public readonly saleDate: Timestamp;
  public readonly createdAt: Timestamp;
  public readonly details: SaleDetail[] = [];

  private constructor(data: SaleData, details: SaleDetail[] = []) {
    this.id = EntityId.create(data.id);
    this.origin = data.origin;
    this.originId = data.originId;
    this.total = Price.create(data.total);
    this.totalCost = Price.create(data.totalCost);
    this.totalProfit = Price.create(data.totalProfit);
    this.itemCount = data.itemCount;
    this.saleDate = Timestamp.fromISOString(data.saleDate);
    this.createdAt = Timestamp.fromISOString(data.createdAt);
    this.details = details;
  }

  static create(data: {
    id?: ID;
    origin: SaleOrigin;
    originId?: string | null;
    total: number;
    totalCost: number;
    totalProfit: number;
    itemCount: number;
    saleDate?: string;
    createdAt?: string;
  }): Sale {
    const now = Timestamp.now().toISOString();
    return new Sale(
      {
        id: data.id ?? EntityId.generate().toString(),
        origin: data.origin,
        originId: data.originId ?? null,
        total: data.total,
        totalCost: data.totalCost,
        totalProfit: data.totalProfit,
        itemCount: data.itemCount,
        saleDate: data.saleDate ?? now,
        createdAt: data.createdAt ?? now,
      },
      []
    );
  }

  static fromData(data: SaleData, details?: SaleDetail[]): Sale {
    return new Sale(data, details ?? []);
  }

  toData(): SaleData {
    return {
      id: this.id.toString(),
      origin: this.origin,
      originId: this.originId,
      total: this.total.toNumber(),
      totalCost: this.totalCost.toNumber(),
      totalProfit: this.totalProfit.toNumber(),
      itemCount: this.itemCount,
      saleDate: this.saleDate.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}
