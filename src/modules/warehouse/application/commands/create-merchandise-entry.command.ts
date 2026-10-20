import { MerchandiseEntry } from "../../domain/entities/merchandise-entry";
import { MerchandiseEntryRepository } from "../ports/merchandise-entry.repository";
import { ProductRepository } from "../../../products/application/ports/product.repository";
import { InventoryMovementRepository } from "../../../inventory/application/ports/inventory-movement.repository";
import { InventoryMovement } from "../../../inventory/domain/entities/inventory-movement";
import { PriceHistory } from "../../../products/domain/entities/price-history";
import { PriceHistoryRepository } from "../../../products/application/ports/price-history.repository";
import { ID } from "../../../../shared/types";

export type CreateMerchandiseEntryCommand = {
  productId: ID;
  quantity: number;
  unitCost: number;
  supplier?: string | null;
  notes?: string | null;
  entryDate?: string;
};

export type CreateMerchandiseEntryResult = {
  entry: MerchandiseEntry;
  success: boolean;
  error?: string;
};

export const createMerchandiseEntry = async (
  command: CreateMerchandiseEntryCommand,
  deps: {
    entryRepo: MerchandiseEntryRepository;
    productRepo: ProductRepository;
    movementRepo: InventoryMovementRepository;
    priceHistoryRepo: PriceHistoryRepository;
  }
): Promise<CreateMerchandiseEntryResult> => {
  try {
    if (!command.productId) {
      return { entry: {} as MerchandiseEntry, success: false, error: "El producto es obligatorio" };
    }
    if (!command.quantity || command.quantity <= 0) {
      return { entry: {} as MerchandiseEntry, success: false, error: "La cantidad debe ser mayor que cero" };
    }
    if (command.unitCost < 0) {
      return { entry: {} as MerchandiseEntry, success: false, error: "El costo unitario no puede ser negativo" };
    }

    const product = await deps.productRepo.findById(command.productId);
    if (!product) {
      return { entry: {} as MerchandiseEntry, success: false, error: "El producto no existe" };
    }

    const previousStock = product.currentStock.toNumber();
    const newStock = previousStock + command.quantity;

    const entry = MerchandiseEntry.create({
      productId: command.productId,
      quantity: command.quantity,
      unitCost: command.unitCost,
      supplier: command.supplier,
      notes: command.notes,
      entryDate: command.entryDate,
    });
    await deps.entryRepo.save(entry);

    const movement = InventoryMovement.create({
      productId: command.productId,
      type: "entry",
      quantity: command.quantity,
      previousStock,
      newStock,
      reason: "Entrada de mercancía",
      referenceId: entry.id.toString(),
      referenceType: "merchandise_entry",
    });
    await deps.movementRepo.save(movement);

    // The purchase price of the product follows the latest entry cost.
    const oldPrice = product.currentPurchasePrice.toNumber();
    await deps.productRepo.save(product.withStockChange(command.quantity).withUpdatedPrice("compra", command.unitCost));

    if (oldPrice !== command.unitCost) {
      await deps.priceHistoryRepo.save(
        PriceHistory.create({
          productId: command.productId,
          priceType: "compra",
          oldPrice,
          newPrice: command.unitCost,
        })
      );
    }

    return { entry, success: true };
  } catch (error: any) {
    return { entry: {} as MerchandiseEntry, success: false, error: error.message || "Error ingresando mercancía" };
  }
};