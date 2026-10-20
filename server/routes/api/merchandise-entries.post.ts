import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { createMerchandiseEntry } from "@/modules/warehouse/application/commands/create-merchandise-entry.command";
import { SqliteMerchandiseEntryRepository } from "@server/infrastructure/persistence/warehouse/merchandise-entry.repository";
import { SqliteProductRepository } from "@server/infrastructure/persistence/products/product.repository";
import { SqliteInventoryMovementRepository } from "@server/infrastructure/persistence/inventory/inventory-movement.repository";
import { SqlitePriceHistoryRepository } from "@server/infrastructure/persistence/products/price-history.repository";

const entryRepo = new SqliteMerchandiseEntryRepository();
const productRepo = new SqliteProductRepository();
const movementRepo = new SqliteInventoryMovementRepository();
const priceHistoryRepo = new SqlitePriceHistoryRepository();

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const result = await createMerchandiseEntry(body, {
    entryRepo,
    productRepo,
    movementRepo,
    priceHistoryRepo,
  });
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return result.entry.toData();
});