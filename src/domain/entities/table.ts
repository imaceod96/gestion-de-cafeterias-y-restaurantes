import { EntityId, Timestamp, Price } from "../core/value-objects";
import { ID, TableStatus } from "../core/types";

export interface TableData {
  id: ID;
  number: number;
  name: string | null;
  status: TableStatus;
  currentAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

export class Table {
  public readonly id: EntityId;
  public readonly number: number;
  public readonly name: string | null;
  public readonly status: TableStatus;
  public readonly currentAccountId: EntityId | null;
  public readonly createdAt: Timestamp;
  public readonly updatedAt: Timestamp;

  private constructor(data: TableData) {
    this.id = EntityId.create(data.id);
    this.number = data.number;
    this.name = data.name;
    this.status = data.status;
    this.currentAccountId = data.currentAccountId
      ? EntityId.create(data.currentAccountId)
      : null;
    this.createdAt = Timestamp.fromISOString(data.createdAt);
    this.updatedAt = Timestamp.fromISOString(data.updatedAt);
  }

  static create(data: {
    id?: ID;
    number: number;
    name?: string | null;
    status?: TableStatus;
    currentAccountId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }): Table {
    const now = Timestamp.now().toISOString();
    return new Table({
      id: data.id ?? EntityId.generate().toString(),
      number: data.number,
      name: data.name ?? null,
      status: data.status ?? "libre",
      currentAccountId: data.currentAccountId ?? null,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  static fromData(data: TableData): Table {
    return new Table(data);
  }

  toData(): TableData {
    return {
      id: this.id.toString(),
      number: this.number,
      name: this.name,
      status: this.status,
      currentAccountId: this.currentAccountId?.toString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  isFree(): boolean {
    return this.status === "libre";
  }

  isOpen(): boolean {
    return this.status === "abierta";
  }

  open(accountId: ID): Table {
    return new Table({
      ...this.toData(),
      status: "abierta",
      currentAccountId: accountId,
      updatedAt: Timestamp.now().toISOString(),
    });
  }

  close(): Table {
    return new Table({
      ...this.toData(),
      status: "libre",
      currentAccountId: null,
      updatedAt: Timestamp.now().toISOString(),
    });
  }
}