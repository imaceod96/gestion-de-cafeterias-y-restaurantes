import { defineHandler } from "nitro";
import { readBody, getRouterParam, createError } from "nitro/h3";
import { updateCategory } from "@/modules/products/application/commands/update-category.command";
import { SqliteCategoryRepository } from "@server/infrastructure/persistence/products/category.repository";

const categoryRepo = new SqliteCategoryRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const result = await updateCategory({ id, ...body }, { categoryRepo });
  if (!result.success || !result.category) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return result.category.toData();
});