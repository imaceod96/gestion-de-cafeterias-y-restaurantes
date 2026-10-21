import { defineHandler } from "nitro";
import { readBody, getRouterParam, createError } from "nitro/h3";
import { updateUnit } from "@/modules/products/application/commands/manage-unit.command";
import { SqliteUnitRepository } from "@server/infrastructure/persistence/products/unit.repository";

const unitRepo = new SqliteUnitRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const result = await updateUnit({ id, ...body }, { unitRepo });
  if (!result.success || !result.unit) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return result.unit.toData();
});