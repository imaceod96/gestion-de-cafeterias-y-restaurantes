import { defineHandler } from "nitro";
import { getRouterParam, createError } from "nitro/h3";
import { getProduct } from "@/modules/products/application/queries/get-product.query";
import { SqliteProductRepository } from "@/modules/products/infrastructure/persistence/sqlite-product.repository";

const productRepo = new SqliteProductRepository();

export default defineHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const result = await getProduct({ id }, { productRepo });
  if (!result.success || !result.product) {
    throw createError({ statusCode: 404, statusMessage: result.error || "Producto no encontrado" });
  }
  return result.product.toData();
});