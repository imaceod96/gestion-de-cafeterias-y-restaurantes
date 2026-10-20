import { EntityId, Timestamp } from "../../../shared/domain/value-objects";
import { ID, InventoryMovementType } from "../../../shared/types";

export interface InventoryMovementData {
  id: ID;
  productId: ID;
  type: InventoryMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  referenceId: string | null;
  referenceType: string | null;
  movementDate: string;
  createdAt: string;
}

export class InventoryMovement {
  public readonly id: EntityId;
  public readonly productId: EntityId;
  public readonly type: InventoryMovementType;
  public readonly quantity: number;
  public readonly previousStock: number;
  public readonly newStock: number;
  public readonly reason: string | null;
  public readonly referenceId: string | null;
  public readonly referenceType: string | null;
  public readonly movementDate: Timestamp;
  public readonly createdAt: Timestamp;

  private constructor(data: InventoryMovementData) {
    this.id = EntityId.create(data.id);
    this.productId = EntityId.create(data.productId);
    this.type = data.type;
    this.quantity = data.quantity;
    this.previousStock = data.previousStock;
    this.newStock = data.newStock;
    this.reason = data.reason;
    this.referenceId = data.referenceId;
    this.referenceType = data.referenceType;
    this.movementDate = Timestamp.fromISOString(data.movementDate);
    this.createdAt = Timestamp.fromISOString(data.createdAt);
  }

  static create(data: {
    id?: ID;
    productId: ID;
    type: InventoryMovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string | null;
    referenceId?: string | null;
    referenceType?: string | null;
    movementDate?: string;
    createdAt?: string;
  }): InventoryMovement {
    const now = Timestamp.now().toISOString();
    return new InventoryMovement({
      id: data.id ?? EntityId.generate().toString(),
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      previousStock: data.previousStock,
      newStock: data.newStock,
      reason: data.reason ?? null,
      referenceId: data.referenceId ?? null,
      referenceType: data.referenceType ?? null,
      movementDate: data.movementDate ?? now,
      createdAt: data.createdAt ?? now,
    });
  }

  static fromData(data: InventoryMovementData): InventoryMovement {
    return new InventoryMovement(data);
  }

  toData(): InventoryMovementData {
    return {
      id: this.id.toString(),
      productId: this.productId.toString(),
      type: this.type,
      quantity: this.quantity,
      previousStock: this.previousStock,
      newStock: this.newStock,
      reason: this.reason,
      referenceId: this.referenceId,
      referenceType: this.referenceType,
      movementDate: this.movementDate.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}