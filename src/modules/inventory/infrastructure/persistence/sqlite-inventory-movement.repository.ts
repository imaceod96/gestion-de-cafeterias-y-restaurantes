import { getDatabase } from "@server/infrastructure/database/client";
import { InventoryMovement } from "../../domain/entities/inventory-movement";
import { InventoryMovementRepository } from "../../application/ports/inventory-movement.repository";
import { ID } from "../../../../shared/types";

export class SqliteInventoryMovementRepository implements InventoryMovementRepository {
  async findAll(productId?: ID): Promise<InventoryMovement[]> {
    const db = getDatabase();
    const rows = productId
      ? (db.prepare("SELECT * FROM inventory_movements WHERE product_id = ? ORDER BY movement_date DESC").all(productId) as any[])
      : (db.prepare("SELECT * FROM inventory_movements ORDER BY movement_date DESC").all() as any[]);
    return rows.map((row) =>
      InventoryMovement.fromData({
        id: row.id,
        productId: row.product_id,
        type: row.type,
        quantity: row.quantity,
        previousStock: row.previous_stock,
        newStock: row.new_stock,
        reason: row.reason,
        referenceId: row.reference_id,
        referenceType: row.reference_type,
        movementDate: row.movement_date,
        createdAt: row.created_at,
      })
    );
  }

  async findById(id: ID): Promise<InventoryMovement | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM inventory_movements WHERE id = ?").get(id) as any | undefined;
    if (!row) return null;
    return InventoryMovement.fromData({
      id: row.id,
      productId: row.product_id,
      type: row.type,
      quantity: row.quantity,
      previousStock: row.previous_stock,
      newStock: row.new_stock,
      reason: row.reason,
      referenceId: row.reference_id,
      referenceType: row.reference_type,
      movementDate: row.movement_date,
      createdAt: row.created_at,
    });
  }

  async save(movement: InventoryMovement): Promise<InventoryMovement> {
    const db = getDatabase();
    const data = movement.toData();
    db.prepare(
      `INSERT INTO inventory_movements (id, product_id, type, quantity, previous_stock, new_stock, reason, reference_id, reference_type, movement_date, created_at)
       VALUES (@id, @productId, @type, @quantity, @previousStock, @newStock, @reason, @referenceId, @referenceType, @movementDate, @createdAt)`
    ).run({
      id: data.id,
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      previousStock: data.previousStock,
      newStock: data.newStock,
      reason: data.reason,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      movementDate: data.movementDate,
      createdAt: data.createdAt,
    });
    return movement;
  }
}