import { EntityId, Timestamp, Price } from "../../../../shared/domain/value-objects";
import { ID, VoucherStatus } from "../../../../shared/types";

export interface VoucherData {
  id: ID;
  code: string;
  status: VoucherStatus;
  total: number;
  saleId: string | null;
  createdBy: string | null;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
}

export class Voucher {
  public readonly id: EntityId;
  public readonly code: string;
  public readonly status: VoucherStatus;
  public readonly total: Price;
  public readonly saleId: EntityId | null;
  public readonly createdBy: string | null;
  public readonly openedAt: Timestamp;
  public readonly closedAt: Timestamp | null;
  public readonly createdAt: Timestamp;

  private constructor(data: VoucherData) {
    this.id = EntityId.create(data.id);
    this.code = data.code;
    this.status = data.status;
    this.total = Price.create(data.total);
    this.saleId = data.saleId ? EntityId.create(data.saleId) : null;
    this.createdBy = data.createdBy;
    this.openedAt = Timestamp.fromISOString(data.openedAt);
    this.closedAt = data.closedAt ? Timestamp.fromISOString(data.closedAt) : null;
    this.createdAt = Timestamp.fromISOString(data.createdAt);
  }

  static create(data: {
    id?: ID;
    code: string;
    status?: VoucherStatus;
    total?: number;
    saleId?: string | null;
    createdBy?: string | null;
    openedAt?: string;
    closedAt?: string | null;
    createdAt?: string;
  }): Voucher {
    const now = Timestamp.now().toISOString();
    return new Voucher({
      id: data.id ?? EntityId.generate().toString(),
      code: data.code,
      status: data.status ?? "abierto",
      total: data.total ?? 0,
      saleId: data.saleId ?? null,
      createdBy: data.createdBy ?? null,
      openedAt: data.openedAt ?? now,
      closedAt: data.closedAt ?? null,
      createdAt: data.createdAt ?? now,
    });
  }

  static fromData(data: VoucherData): Voucher {
    return new Voucher(data);
  }

  toData(): VoucherData {
    return {
      id: this.id.toString(),
      code: this.code,
      status: this.status,
      total: this.total.toNumber(),
      saleId: this.saleId?.toString() ?? null,
      createdBy: this.createdBy,
      openedAt: this.openedAt.toISOString(),
      closedAt: this.closedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
    };
  }

  isOpen(): boolean {
    return this.status === "abierto";
  }

  isClosed(): boolean {
    return this.status === "cerrado";
  }

  close(saleId: ID, total: number): Voucher {
    return new Voucher({
      ...this.toData(),
      status: "cerrado",
      saleId,
      total,
      closedAt: Timestamp.now().toISOString(),
    });
  }
}