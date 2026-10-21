import { defineHandler } from "nitro";
import { getRouterParam, createError } from "nitro/h3";
import { closeTable } from "@/modules/tables/application/commands/close-table.command";
import { SqliteTableAccountRepository } from "@server/infrastructure/persistence/tables/table-account.repository";
import { SqliteSaleRepository } from "@server/infrastructure/persistence/sales/sale.repository";
import { SqliteVoucherRepository } from "@server/infrastructure/persistence/sales/voucher.repository";
import { SqliteProductRepository } from "@server/infrastructure/persistence/products/product.repository";
import { SqliteInventoryMovementRepository } from "@server/infrastructure/persistence/inventory/inventory-movement.repository";

const tableAccountRepo = new SqliteTableAccountRepository();
const saleRepo = new SqliteSaleRepository();
const voucherRepo = new SqliteVoucherRepository();
const productRepo = new SqliteProductRepository();
const movementRepo = new SqliteInventoryMovementRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }
  const result = await closeTable(
    { accountId: id },
    { tableAccountRepo, saleRepo, voucherRepo, productRepo, movementRepo }
  );
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return { account: result.account?.toData(), voucher: result.voucher?.toData() };
});