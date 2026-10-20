import { defineHandler } from "nitro";
import { createError } from "nitro/h3";
import { getUnits } from "@/modules/products/application/queries/get-units.query";
import { SqliteUnitRepository } from "@/server/infrastructure/persistence/products/unit.repository";

const unitRepo = new SqliteUnitRepository();

export default defineHandler(async () => {
  const result = await getUnits({ unitRepo });
  if (!result.success) {
    throw createError({ statusCode: 500, statusMessage: result.error });
  }
  return result.units.map((u) => u.toData());
});