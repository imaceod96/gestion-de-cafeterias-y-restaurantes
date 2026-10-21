import { EntityId, Timestamp, Price, StockQuantity, Percentage, ProfitMargin } from "../../../../shared/domain/value-objects";
import { ID, Unit, PriceType } from "../../../../shared/types";

export interface ProductData {
  id: ID;
  categoryId: ID | null;
  name: string;
  description: string | null;
  unit: Unit;
  currentPurchasePrice: number;
  currentSalePrice: number;
  currentStock: number;
  minStock: number;
  isActive: boolean;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export class Product {
  public readonly id: EntityId;
  public readonly categoryId: EntityId | null;
  public readonly name: string;
  public readonly description: string | null;
  public readonly unit: Unit;
  public readonly currentPurchasePrice: Price;
  public readonly currentSalePrice: Price;
  public readonly currentStock: StockQuantity;
  public readonly minStock: StockQuantity;
  public readonly isActive: boolean;
  public readonly photoUrl: string | null;
  public readonly createdAt: Timestamp;
  public readonly updatedAt: Timestamp;

  private constructor(data: ProductData) {
    this.id = EntityId.create(data.id);
    this.categoryId = data.categoryId ? EntityId.create(data.categoryId) : null;
    this.name = data.name;
    this.description = data.description;
    this.unit = data.unit;
    this.currentPurchasePrice = Price.create(data.currentPurchasePrice);
    this.currentSalePrice = Price.create(data.currentSalePrice);
    this.currentStock = StockQuantity.create(data.currentStock);
    this.minStock = StockQuantity.create(data.minStock);
    this.isActive = data.isActive;
    this.photoUrl = data.photoUrl;
    this.createdAt = Timestamp.fromISOString(data.createdAt);
    this.updatedAt = Timestamp.fromISOString(data.updatedAt);
  }

  static create(data: {
    id?: ID;
    categoryId?: ID | null;
    name: string;
    description?: string | null;
    unit: Unit;
    currentPurchasePrice: number;
    currentSalePrice: number;
    currentStock?: number;
    minStock?: number;
    isActive?: boolean;
    photoUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }): Product {
    const now = Timestamp.now().toISOString();
    return new Product({
      id: data.id ?? EntityId.generate().toString(),
      categoryId: data.categoryId ?? null,
      name: data.name,
      description: data.description ?? null,
      unit: data.unit,
      currentPurchasePrice: data.currentPurchasePrice,
      currentSalePrice: data.currentSalePrice,
      currentStock: data.currentStock ?? 0,
      minStock: data.minStock ?? 0,
      isActive: data.isActive ?? true,
      photoUrl: data.photoUrl ?? null,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  static fromData(data: ProductData): Product {
    return new Product(data);
  }

  toData(): ProductData {
    return {
      id: this.id.toString(),
      categoryId: this.categoryId?.toString() ?? null,
      name: this.name,
      description: this.description,
      unit: this.unit,
      currentPurchasePrice: this.currentPurchasePrice.toNumber(),
      currentSalePrice: this.currentSalePrice.toNumber(),
      currentStock: this.currentStock.toNumber(),
      minStock: this.minStock.toNumber(),
      isActive: this.isActive,
      photoUrl: this.photoUrl,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  getProfitMargin(): ProfitMargin {
    return ProfitMargin.calculate(this.currentSalePrice, this.currentPurchasePrice);
  }

  getProfitAmount(): Price {
    return this.currentSalePrice.subtract(this.currentPurchasePrice);
  }

  isLowStock(): boolean {
    return this.currentStock.toNumber() <= this.minStock.toNumber();
  }

  withUpdatedPrice(priceType: PriceType, newPrice: number): Product {
    const now = Timestamp.now().toISOString();
    return new Product({
      ...this.toData(),
      currentPurchasePrice: priceType === "compra" ? newPrice : this.currentPurchasePrice.toNumber(),
      currentSalePrice: priceType === "venta" ? newPrice : this.currentSalePrice.toNumber(),
      updatedAt: now,
    });
  }

  withStockChange(quantity: number): Product {
    const newStock = this.currentStock.toNumber() + quantity;
    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }
    return new Product({
      ...this.toData(),
      currentStock: newStock,
      updatedAt: Timestamp.now().toISOString(),
    });
  }

  withPhoto(photoUrl: string | null): Product {
    return new Product({
      ...this.toData(),
      photoUrl,
      updatedAt: Timestamp.now().toISOString(),
    });
  }

  deactivate(): Product {
    return new Product({
      ...this.toData(),
      isActive: false,
      updatedAt: Timestamp.now().toISOString(),
    });
  }

  activate(): Product {
    return new Product({
      ...this.toData(),
      isActive: true,
      updatedAt: Timestamp.now().toISOString(),
    });
  }
}