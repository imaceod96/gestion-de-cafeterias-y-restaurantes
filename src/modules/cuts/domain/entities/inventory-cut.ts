import { EntityId, Timestamp, Price } from "../../../../shared/domain/value-objects";
import { ID, CutStatus } from "../../../../shared/types";

export interface CutDetailData {
  id: ID;
  cutId: ID;
  productId: ID;
  productName: string;
  physicalCount: number;
  expectedCount: number;
  difference: number;
  unitCost: number;
  totalCost: number;
  createdAt: string;
}

export class CutDetail {
  public readonly id: EntityId;
  public readonly cutId: EntityId;
  public readonly productId: EntityId;
  public readonly productName: string;
  public readonly physicalCount: number;
  public readonly expectedCount: number;
  public readonly difference: number;
  public readonly unitCost: Price;
  public readonly totalCost: Price;
  public readonly createdAt: Timestamp;

  private constructor(data: CutDetailData) {
    this.id = EntityId.create(data.id);
    this.cutId = EntityId.create(data.cutId);
    this.productId = EntityId.create(data.productId);
    this.productName = data.productName;
    this.physicalCount = data.physicalCount;
    this.expectedCount = data.expectedCount;
    this.difference = data.physicalCount - data.expectedCount;
    this.unitCost = Price.create(data.unitCost);
    this.totalCost = Price.create(data.totalCost);
    this.createdAt = Timestamp.fromISOString(data.createdAt);
  }

  static create(data: {
    id?: ID;
    cutId: ID;
    productId: ID;
    productName: string;
    physicalCount: number;
    expectedCount: number;
    unitCost: number;
    totalCost?: number;
    createdAt?: string;
  }): CutDetail {
    const now = Timestamp.now().toISOString();
    const totalCost = data.totalCost ?? data.physicalCount * data.unitCost;
    return new CutDetail({
      id: data.id ?? EntityId.generate().toString(),
      cutId: data.cutId,
      productId: data.productId,
      productName: data.productName,
      physicalCount: data.physicalCount,
      expectedCount: data.expectedCount,
      unitCost: data.unitCost,
      totalCost,
      createdAt: data.createdAt ?? now,
    });
  }

  static fromData(data: CutDetailData): CutDetail {
    return new CutDetail(data);
  }

  toData(): CutDetailData {
    return {
      id: this.id.toString(),
      cutId: this.cutId.toString(),
      productId: this.productId.toString(),
      productName: this.productName,
      physicalCount: this.physicalCount,
      expectedCount: this.expectedCount,
      difference: this.difference,
      unitCost: this.unitCost.toNumber(),
      totalCost: this.totalCost.toNumber(),
      createdAt: this.createdAt.toISOString(),
    };
  }

  isMatch(): boolean {
    return this.difference === 0;
  }
}

export interface CutData {
  id: ID;
  date: string;
  status: CutStatus;
  details: CutDetail[];
  createdAt: string;
}

export class InventoryCut {
  public readonly id: EntityId;
  public readonly date: Timestamp;
  public readonly status: CutStatus;
  public readonly details: CutDetail[] = [];
  public readonly createdAt: Timestamp;

  private constructor(data: CutData) {
    this.id = EntityId.create(data.id);
    this.date = Timestamp.fromISOString(data.date);
    this.status = data.status;
    this.details = data.details;
    this.createdAt = Timestamp.fromISOString(data.createdAt);
  }

  static create(data: {
    id?: ID;
    date?: string;
    status?: CutStatus;
    details?: CutDetail[];
    createdAt?: string;
  }): InventoryCut {
    const now = Timestamp.now().toISOString();
    return new InventoryCut({
      id: data.id ?? EntityId.generate().toString(),
      date: data.date ?? now,
      status: data.status ?? "pendiente",
      details: data.details ?? [],
      createdAt: data.createdAt ?? now,
    });
  }

  static fromData(data: CutData): InventoryCut {
    return new InventoryCut(data);
  }

  toData(): CutData {
    return {
      id: this.id.toString(),
      date: this.date.toISOString(),
      status: this.status,
      details: this.details.map((d) => d.toData()),
      createdAt: this.createdAt.toISOString(),
    };
  }

  isCompleted(): boolean {
    return this.status === "completado";
  }

  addDetail(detail: CutDetail): InventoryCut {
    return new InventoryCut({
      ...this.toData(),
      details: [...this.details, detail],
    });
  }
}