import { defineHandler } from "nitro";
import { getQuery } from "nitro/h3";
import { getMerchandiseEntries } from "@/modules/warehouse/application/queries/get-merchandise-entries.query";
import { SqliteMerchandiseEntryRepository } from "@/modules/warehouse/infrastructure/persistence/sqlite-merchandise-entry.repository";

const entryRepo = new SqliteMerchandiseEntryRepository();

export default defineHandler(async (event) => {
  const { productId } = getQuery(event);
  const result = await getMerchandiseEntries(
    { productId },
    { entryRepo }
  );
  if (!result.success) {
    throw createError({ statusCode: 500, statusMessage: result.error });
  }
  return result.entries.map((e) => e.toData());
});