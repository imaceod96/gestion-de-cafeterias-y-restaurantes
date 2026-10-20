import { defineHandler } from "nitro";
import { readBody, getRouterParam, createError } from "nitro/h3";
import { updateProduct } from "@/modules/products/application/commands/update-product.command";
import { SqliteProductRepository } from "@server/infrastructure/persistence/products/product.repository";

const productRepo = new SqliteProductRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const result = await updateProduct({ id, ...body }, { productRepo });
  if (!result.success || !result.product) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return result.product.toData();
});