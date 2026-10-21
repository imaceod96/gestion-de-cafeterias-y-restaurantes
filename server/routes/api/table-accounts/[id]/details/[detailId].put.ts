import { defineHandler } from "nitro";
import { readBody, getRouterParam, createError } from "nitro/h3";
import { updateTableDetail } from "@/modules/tables/application/commands/update-table-detail.command";
import { SqliteTableAccountRepository } from "@server/infrastructure/persistence/tables/table-account.repository";
import { SqliteProductRepository } from "@server/infrastructure/persistence/products/product.repository";

const tableAccountRepo = new SqliteTableAccountRepository();
const productRepo = new SqliteProductRepository();

export default defineHandler(async (event) => {
  const accountId = getRouterParam(event, "id");
  const detailId = getRouterParam(event, "detailId");
  if (!accountId || !detailId) {
    throw createError({ statusCode: 400, statusMessage: "accountId and detailId are required" });
  }
  const body = await readBody<{ quantity: number }>(event);
  const result = await updateTableDetail(
    { accountId, detailId, quantity: body.quantity },
    { tableAccountRepo, productRepo }
  );
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return { account: result.account?.toData(), detail: result.detail?.toData() };
});