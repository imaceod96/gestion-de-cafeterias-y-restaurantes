import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { createMerchandiseEntry } from "@/modules/warehouse/application/commands/create-merchandise-entry.command";
import { SqliteMerchandiseEntryRepository } from "@/server/modules/warehouse/infrastructure/persistence/sqlite-merchandise-entry.repository";
import { SqliteProductRepository } from "@/server/modules/products/infrastructure/persistence/sqlite-product.repository";
import { SqliteInventoryMovementRepository } from "@/server/modules/inventory/infrastructure/persistence/sqlite-inventory-movement.repository";
import { SqlitePriceHistoryRepository } from "@/server/modules/products/infrastructure/persistence/sqlite-price-history.repository";

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