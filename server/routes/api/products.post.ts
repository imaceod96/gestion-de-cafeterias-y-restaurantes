import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { createProduct } from "@/modules/products/application/commands/create-product.command";
import { SqliteProductRepository } from "@server/infrastructure/persistence/products/product.repository";

const productRepo = new SqliteProductRepository();

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const result = await createProduct(body, { productRepo });
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return result.product.toData();
});