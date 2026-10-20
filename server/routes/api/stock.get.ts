import { defineHandler } from "nitro";
import { getQuery } from "nitro/h3";
import { getCurrentStock } from "@/modules/inventory/application/queries/get-current-stock.query";
import { SqliteProductRepository } from "@/modules/products/infrastructure/persistence/sqlite-product.repository";
import { SqliteInventoryMovementRepository } from "@/modules/inventory/infrastructure/persistence/sqlite-inventory-movement.repository";

const productRepo = new SqliteProductRepository();
const movementRepo = new SqliteInventoryMovementRepository();

export default defineHandler(async (event) => {
  const { productId } = getQuery(event);
  const result = await getCurrentStock(
    { productId },
    { productRepo, movementRepo }
  );
  if (!result.success) {
    throw createError({ statusCode: 500, statusMessage: result.error });
  }
  return result.items;
});