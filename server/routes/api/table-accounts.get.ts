import { defineHandler } from "nitro";
import { getQuery, createError } from "nitro/h3";
import { SqliteTableAccountRepository } from "@server/infrastructure/persistence/tables/table-account.repository";

const tableAccountRepo = new SqliteTableAccountRepository();

export default defineHandler(async (event) => {
  const { tableId, open } = getQuery(event);
  if (tableId) {
    const account = await tableAccountRepo.findByTableId(tableId as string);
    return account ? account.toData() : null;
  }
  const accounts = open === "true"
    ? await tableAccountRepo.findOpen()
    : await tableAccountRepo.findAll();
  return accounts.map((a) => a.toData());
});