import { EntityId, Timestamp, Price, StockQuantity, ProfitMargin } from "../../../../shared/domain/value-objects";
import { ID } from "../../../../shared/types";

export interface MerchandiseEntryData {
  id: ID;
  productId: ID;
  quantity: number;
  unit: string;
  unitCost: number;
  unitSalePrice: number;
  totalCost: number;
  supplier: string | null;
  notes: string | null;
  entryDate: string;
  createdAt: string;
}

export class MerchandiseEntry {
  public readonly id: EntityId;
  public readonly productId: EntityId;
  public readonly quantity: StockQuantity;
  public readonly unit: string;
  public readonly unitCost: Price;
  public readonly unitSalePrice: Price;
  public readonly totalCost: Price;
  public readonly supplier: string | null;
  public readonly notes: string | null;
  public readonly entryDate: Timestamp;
  public readonly createdAt: Timestamp;

  private constructor(data: MerchandiseEntryData) {
    this.id = EntityId.create(data.id);
    this.productId = EntityId.create(data.productId);
    this.quantity = StockQuantity.create(data.quantity);
    this.unit = data.unit;
    this.unitCost = Price.create(data.unitCost);
    this.unitSalePrice = Price.create(data.unitSalePrice);
    this.totalCost = Price.create(data.totalCost);
    this.supplier = data.supplier;
    this.notes = data.notes;
    this.entryDate = Timestamp.fromISOString(data.entryDate);
    this.createdAt = Timestamp.fromISOString(data.createdAt);
  }

  static create(data: {
    id?: ID;
    productId: ID;
    quantity: number;
    unit: string;
    unitCost: number;
    unitSalePrice: number;
    supplier?: string | null;
    notes?: string | null;
    entryDate?: string;
    createdAt?: string;
  }): MerchandiseEntry {
    const now = Timestamp.now().toISOString();
    const totalCost = data.quantity * data.unitCost;
    return new MerchandiseEntry({
      id: data.id ?? EntityId.generate().toString(),
      productId: data.productId,
      quantity: data.quantity,
      unit: data.unit,
      unitCost: data.unitCost,
      unitSalePrice: data.unitSalePrice,
      totalCost,
      supplier: data.supplier ?? null,
      notes: data.notes ?? null,
      entryDate: data.entryDate ?? now,
      createdAt: data.createdAt ?? now,
    });
  }

  static fromData(data: MerchandiseEntryData): MerchandiseEntry {
    return new MerchandiseEntry(data);
  }

  getProfitMargin(): ProfitMargin {
    return ProfitMargin.calculate(this.unitSalePrice, this.unitCost);
  }

  toData(): MerchandiseEntryData {
    return {
      id: this.id.toString(),
      productId: this.productId.toString(),
      quantity: this.quantity.toNumber(),
      unit: this.unit,
      unitCost: this.unitCost.toNumber(),
      unitSalePrice: this.unitSalePrice.toNumber(),
      totalCost: this.totalCost.toNumber(),
      supplier: this.supplier,
      notes: this.notes,
      entryDate: this.entryDate.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}