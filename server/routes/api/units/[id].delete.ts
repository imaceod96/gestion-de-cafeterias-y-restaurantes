import { defineHandler } from "nitro";
import { getRouterParam, createError } from "nitro/h3";
import { deleteUnit } from "@/modules/products/application/commands/manage-unit.command";
import { SqliteUnitRepository } from "@server/infrastructure/persistence/products/unit.repository";

const unitRepo = new SqliteUnitRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const result = await deleteUnit(id, { unitRepo });
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return { ok: true };
});