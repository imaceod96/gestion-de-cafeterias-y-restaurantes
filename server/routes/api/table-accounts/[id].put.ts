import { defineHandler } from "nitro";
import { readBody, getRouterParam, createError } from "nitro/h3";
import { SqliteTableAccountRepository } from "@server/infrastructure/persistence/tables/table-account.repository";
import { TableAccount } from "@/modules/tables/domain/entities/table-account";

const tableAccountRepo = new SqliteTableAccountRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }
  const body = await readBody(event);
  const account = await tableAccountRepo.findById(id);
  if (!account) {
    throw createError({ statusCode: 404, statusMessage: "Table account not found" });
  }
  const updatedAccount = TableAccount.fromData(body, account.details);
  const saved = await tableAccountRepo.save(updatedAccount);
  return saved.toData();
});