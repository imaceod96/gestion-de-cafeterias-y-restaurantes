import { defineHandler } from "nitro";
import { getRouterParam, createError } from "nitro/h3";
import { SqliteCategoryRepository } from "@server/infrastructure/persistence/products/category.repository";

const categoryRepo = new SqliteCategoryRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const existing = await categoryRepo.findById(id);
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" });
  }
  await categoryRepo.delete(id);
  return { ok: true };
});