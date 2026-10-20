import { InventoryMovement } from "../../domain/entities/inventory-movement";
import { ID } from "../../../../shared/types";

export interface InventoryMovementRepository {
  findAll(productId?: ID): Promise<InventoryMovement[]>;
  findById(id: ID): Promise<InventoryMovement | null>;
  save(movement: InventoryMovement): Promise<InventoryMovement>;
}
