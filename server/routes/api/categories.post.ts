import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { createCategory } from "@/modules/products/application/commands/create-category.command";
import { SqliteCategoryRepository } from "@server/infrastructure/persistence/products/category.repository";

const categoryRepo = new SqliteCategoryRepository();

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const result = await createCategory(body, { categoryRepo });
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return result.category.toData();
});