import { InventoryMovement } from "../../domain/entities/inventory-movement";
import { InventoryMovementRepository } from "../ports/inventory-movement.repository";
import { ID } from "../../../../shared/types";

export class HttpInventoryMovementRepository implements InventoryMovementRepository {
  async findAll(productId?: ID): Promise<InventoryMovement[]> {
    const url = productId ? `/api/stock?productId=${productId}` : "/api/stock";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error obteniendo movimientos");
    const data = await res.json();
    return data.map((row: any) => InventoryMovement.fromData({
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
    }));
  }

  async findById(id: ID): Promise<InventoryMovement | null> {
    throw new Error("Not implemented");
  }

  async save(movement: InventoryMovement): Promise<InventoryMovement> {
    throw new Error("Movements are created server-side only");
  }
}