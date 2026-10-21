import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { createUnit } from "@/modules/products/application/commands/manage-unit.command";
import { SqliteUnitRepository } from "@server/infrastructure/persistence/products/unit.repository";

const unitRepo = new SqliteUnitRepository();

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const result = await createUnit(body, { unitRepo });
  if (!result.success || !result.unit) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return result.unit.toData();
});