import { defineHandler } from "nitro";
import { getQuery, createError } from "nitro/h3";
import { SqliteTableRepository } from "@server/infrastructure/persistence/tables/table.repository";
import { getOpenTables } from "@/modules/tables/application/queries/get-open-tables.query";

const tableRepo = new SqliteTableRepository();

export default defineHandler(async (event) => {
  const { open = "true" } = getQuery(event);
  const includeClosed = open !== "true";
  const result = await getOpenTables(
    { includeClosed },
    { tableRepo }
  );
  if (!result.success) {
    throw createError({ statusCode: 500, statusMessage: result.error });
  }
  return result.tables.map((t) => t.toData());
});