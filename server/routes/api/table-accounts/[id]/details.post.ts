import { defineHandler } from "nitro";
import { readBody, getRouterParam, createError } from "nitro/h3";
import { addTableDetail } from "@/modules/tables/application/commands/add-table-detail.command";
import { SqliteTableAccountRepository } from "@server/infrastructure/persistence/tables/table-account.repository";
import { SqliteProductRepository } from "@server/infrastructure/persistence/products/product.repository";

const tableAccountRepo = new SqliteTableAccountRepository();
const productRepo = new SqliteProductRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }
  const body = await readBody<{ productId: string; quantity: number }>(event);
  if (!body.productId) {
    throw createError({ statusCode: 400, statusMessage: "productId is required" });
  }
  const result = await addTableDetail(
    { accountId: id, productId: body.productId, quantity: body.quantity ?? 1 },
    { tableAccountRepo, productRepo }
  );
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return { account: result.account?.toData(), detail: result.detail?.toData() };
});