import { defineHandler } from "nitro";
import { getCategories } from "@/modules/products/application/queries/get-categories.query";
import { SqliteCategoryRepository } from "@/modules/products/infrastructure/persistence/sqlite-category.repository";

const categoryRepo = new SqliteCategoryRepository();

export default defineHandler(async () => {
  const result = await getCategories({ categoryRepo });
  if (!result.success) {
    throw createError({ statusCode: 500, statusMessage: result.error });
  }
  return result.categories.map((c) => c.toData());
});