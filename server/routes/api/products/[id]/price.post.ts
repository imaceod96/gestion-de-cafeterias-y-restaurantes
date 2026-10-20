import { defineHandler } from "nitro";
import { readBody, getRouterParam, createError } from "nitro/h3";
import { changePrice } from "@/modules/products/application/commands/change-price.command";
import { SqliteProductRepository } from "@server/infrastructure/persistence/products/product.repository";
import { SqlitePriceHistoryRepository } from "@server/infrastructure/persistence/products/price-history.repository";

const productRepo = new SqliteProductRepository();
const priceHistoryRepo = new SqlitePriceHistoryRepository();

export default defineHandler(async (event) => {
  const productId = getRouterParam(event, "id");
  const body = await readBody(event);
  const result = await changePrice(
    { productId, priceType: body.priceType, newPrice: body.newPrice, changedBy: body.changedBy },
    { productRepo, priceHistoryRepo }
  );
  if (!result.success || !result.product) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return {
    product: result.product.toData(),
    priceHistory: result.priceHistory?.toData() ?? null,
  };
});