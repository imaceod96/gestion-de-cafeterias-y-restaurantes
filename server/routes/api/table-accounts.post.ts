import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { createTableAccount } from "@/modules/tables/application/commands/create-table-account.command";
import { SqliteTableAccountRepository } from "@server/infrastructure/persistence/tables/table-account.repository";

const tableAccountRepo = new SqliteTableAccountRepository();

export default defineHandler(async (event) => {
  const body = await readBody<{ tableId?: number; name?: string | null }>(event);
  if (body.tableId === undefined || body.tableId === null) {
    throw createError({ statusCode: 400, statusMessage: "table number is required" });
  }
  const result = await createTableAccount(
    { tableId: body.tableId, name: body.name ?? null },
    { tableAccountRepo }
  );
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return result.account?.toData();
});