import { defineHandler } from "nitro";
import { getQuery, createError } from "nitro/h3";
import { getProducts } from "@/modules/products/application/queries/get-products.query";
import { SqliteProductRepository } from "@server/infrastructure/persistence/products/product.repository";

const productRepo = new SqliteProductRepository();

export default defineHandler(async (event) => {
  const { activeOnly = "true" } = getQuery(event);
  const result = await getProducts(
    { activeOnly: activeOnly === "true" },
    { productRepo }
  );
  if (!result.success) {
    throw createError({ statusCode: 500, statusMessage: result.error });
  }
  return result.products.map((p) => p.toData());
});