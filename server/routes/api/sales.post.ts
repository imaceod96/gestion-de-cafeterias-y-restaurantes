import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { createSale } from "@/modules/sales/application/commands/create-sale.command";
import { SqliteSaleRepository } from "@server/infrastructure/persistence/sales/sale.repository";
import { SqliteVoucherRepository } from "@server/infrastructure/persistence/sales/voucher.repository";
import { SqliteProductRepository } from "@server/infrastructure/persistence/products/product.repository";
import { SqliteInventoryMovementRepository } from "@server/infrastructure/persistence/inventory/inventory-movement.repository";

const saleRepo = new SqliteSaleRepository();
const voucherRepo = new SqliteVoucherRepository();
const productRepo = new SqliteProductRepository();
const movementRepo = new SqliteInventoryMovementRepository();

export default defineHandler(async (event) => {
  const body = await readBody<{ origin?: string; originId?: string | null; items?: Array<{ productId: string; quantity: number }> }>(event);
  if (!body.origin) {
    throw createError({ statusCode: 400, statusMessage: "origin is required" });
  }
  const result = await createSale(
    {
      origin: body.origin as any,
      originId: body.originId ?? null,
      items: body.items ?? [],
    },
    { saleRepo, voucherRepo, productRepo, movementRepo }
  );
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return { sale: result.sale?.toData(), voucher: result.voucher?.toData() };
});