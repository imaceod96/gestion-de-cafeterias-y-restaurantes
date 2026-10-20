import { defineHandler } from "nitro";
import { getRouterParam, createError } from "nitro/h3";
import { deleteProduct } from "@/modules/products/application/commands/delete-product.command";
import { SqliteProductRepository } from "@/modules/products/infrastructure/persistence/sqlite-product.repository";

const productRepo = new SqliteProductRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const result = await deleteProduct({ id }, { productRepo });
  if (!result.success) {
    throw createError({ statusCode: 404, statusMessage: result.error });
  }
  return { ok: true };
});