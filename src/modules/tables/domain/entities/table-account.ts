import { EntityId, Timestamp, Price, StockQuantity } from "../../../../shared/domain/value-objects";
import { ID } from "../../../../shared/types";

export interface TableAccountDetailData {
  id: ID;
  accountId: ID;
  productId: ID;
  productName: string;
  quantity: number;
  unitSalePrice: number;
  unitCost: number;
  total: number;
  addedAt: string;
  createdAt: string;
}

export class TableAccountDetail {
  public readonly id: EntityId;
  public readonly accountId: EntityId;
  public readonly productId: EntityId;
  public readonly productName: string;
  public readonly quantity: StockQuantity;
  public readonly unitSalePrice: Price;
  public readonly unitCost: Price;
  public readonly total: Price;
  public readonly addedAt: Timestamp;
  public readonly createdAt: Timestamp;

  private constructor(data: TableAccountDetailData) {
    this.id = EntityId.create(data.id);
    this.accountId = EntityId.create(data.accountId);
    this.productId = EntityId.create(data.productId);
    this.productName = data.productName;
    this.quantity = StockQuantity.create(data.quantity);
    this.unitSalePrice = Price.create(data.unitSalePrice);
    this.unitCost = Price.create(data.unitCost);
    this.total = Price.create(data.total);
    this.addedAt = Timestamp.fromISOString(data.addedAt);
    this.createdAt = Timestamp.fromISOString(data.createdAt);
  }

  static create(data: {
    id?: ID;
    accountId: ID;
    productId: ID;
    productName: string;
    quantity: number;
    unitSalePrice: number;
    unitCost: number;
    total?: number;
    addedAt?: string;
    createdAt?: string;
  }): TableAccountDetail {
    const now = Timestamp.now().toISOString();
    const total = data.total ?? data.quantity * data.unitSalePrice;
    return new TableAccountDetail({
      id: data.id ?? EntityId.generate().toString(),
      accountId: data.accountId,
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      unitSalePrice: data.unitSalePrice,
      unitCost: data.unitCost,
      total,
      addedAt: data.addedAt ?? now,
      createdAt: data.createdAt ?? now,
    });
  }

  static fromData(data: TableAccountDetailData): TableAccountDetail {
    return new TableAccountDetail(data);
  }

  toData(): TableAccountDetailData {
    return {
      id: this.id.toString(),
      accountId: this.accountId.toString(),
      productId: this.productId.toString(),
      productName: this.productName,
      quantity: this.quantity.toNumber(),
      unitSalePrice: this.unitSalePrice.toNumber(),
      unitCost: this.unitCost.toNumber(),
      total: this.total.toNumber(),
      addedAt: this.addedAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}

export interface TableAccountData {
  id: ID;
  tableId: ID;
  status: "abierta" | "cerrada";
  total: number;
  totalCost: number;
  itemCount: number;
  openedAt: string;
  closedAt: string | null;
  saleId: string | null;
  createdAt: string;
}

export class TableAccount {
  public readonly id: EntityId;
  public readonly tableId: EntityId;
  public readonly status: "abierta" | "cerrada";
  public readonly total: Price;
  public readonly totalCost: Price;
  public readonly itemCount: number;
  public readonly openedAt: Timestamp;
  public readonly closedAt: Timestamp | null;
  public readonly saleId: EntityId | null;
  public readonly createdAt: Timestamp;
  public readonly details: TableAccountDetail[] = [];

  private constructor(data: TableAccountData, details: TableAccountDetail[] = []) {
    this.id = EntityId.create(data.id);
    this.tableId = EntityId.create(data.tableId);
    this.status = data.status;
    this.total = Price.create(data.total);
    this.totalCost = Price.create(data.totalCost);
    this.itemCount = data.itemCount;
    this.openedAt = Timestamp.fromISOString(data.openedAt);
    this.closedAt = data.closedAt ? Timestamp.fromISOString(data.closedAt) : null;
    this.saleId = data.saleId ? EntityId.create(data.saleId) : null;
    this.createdAt = Timestamp.fromISOString(data.createdAt);
    this.details = details;
  }

  static create(data: {
    id?: ID;
    tableId: ID;
    status?: "abierta" | "cerrada";
    total?: number;
    totalCost?: number;
    itemCount?: number;
    openedAt?: string;
    closedAt?: string | null;
    saleId?: string | null;
    createdAt?: string;
  }): TableAccount {
    const now = Timestamp.now().toISOString();
    return new TableAccount(
      {
        id: data.id ?? EntityId.generate().toString(),
        tableId: data.tableId,
        status: data.status ?? "abierta",
        total: data.total ?? 0,
        totalCost: data.totalCost ?? 0,
        itemCount: data.itemCount ?? 0,
        openedAt: data.openedAt ?? now,
        closedAt: data.closedAt ?? null,
        saleId: data.saleId ?? null,
        createdAt: data.createdAt ?? now,
      },
      []
    );
  }

  static fromData(data: TableAccountData, details?: TableAccountDetail[]): TableAccount {
    return new TableAccount(data, details ?? []);
  }

  toData(): TableAccountData {
    return {
      id: this.id.toString(),
      tableId: this.tableId.toString(),
      status: this.status,
      total: this.total.toNumber(),
      totalCost: this.totalCost.toNumber(),
      itemCount: this.itemCount,
      openedAt: this.openedAt.toISOString(),
      closedAt: this.closedAt?.toISOString() ?? null,
      saleId: this.saleId?.toString() ?? null,
      createdAt: this.createdAt.toISOString(),
    };
  }

  isOpen(): boolean {
    return this.status === "abierta";
  }

  isClosed(): boolean {
    return this.status === "cerrada";
  }

  addDetail(detail: TableAccountDetail): TableAccount {
    const newTotal = this.total.add(detail.total);
    const newTotalCost = this.totalCost.add(detail.unitCost.multiply(detail.quantity.toNumber()));
    return new TableAccount(
      {
        ...this.toData(),
        total: newTotal.toNumber(),
        totalCost: newTotalCost.toNumber(),
        itemCount: this.itemCount + 1,
      },
      [...this.details, detail]
    );
  }

  replaceDetails(details: TableAccountDetail[]): TableAccount {
    const newTotal = details.reduce((sum, d) => sum + d.total.toNumber(), 0);
    const newTotalCost = details.reduce((sum, d) => sum + d.unitCost.toNumber() * d.quantity.toNumber(), 0);
    return new TableAccount(
      {
        ...this.toData(),
        total: newTotal,
        totalCost: newTotalCost,
        itemCount: details.length,
      },
      details
    );
  }

  close(saleId: ID): TableAccount {
    return new TableAccount(
      {
        ...this.toData(),
        status: "cerrada",
        saleId,
        closedAt: Timestamp.now().toISOString(),
      },
      this.details
    );
  }
}