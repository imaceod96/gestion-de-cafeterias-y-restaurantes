import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { createTable } from "@/modules/tables/application/commands/create-table.command";
import { SqliteTableRepository } from "@server/infrastructure/persistence/tables/table.repository";

const tableRepo = new SqliteTableRepository();

export default defineHandler(async (event) => {
  const body = await readBody<{ number?: number; name?: string | null }>(event);
  if (body.number === undefined || body.number === null) {
    throw createError({ statusCode: 400, statusMessage: "number is required" });
  }
  const result = await createTable(
    { number: body.number, name: body.name ?? null },
    { tableRepo }
  );
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return result.table?.toData();
});
