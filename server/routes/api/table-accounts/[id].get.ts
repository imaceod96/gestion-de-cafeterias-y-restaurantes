import { defineHandler } from "nitro";
import { getRouterParam, createError } from "nitro/h3";
import { SqliteTableAccountRepository } from "@server/infrastructure/persistence/tables/table-account.repository";

const tableAccountRepo = new SqliteTableAccountRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }
  const account = await tableAccountRepo.findById(id);
  if (!account) {
    throw createError({ statusCode: 404, statusMessage: "Table account not found" });
  }
  return account.toData();
});