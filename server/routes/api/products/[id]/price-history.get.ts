import { defineHandler } from "nitro";
import { getRouterParam, createError } from "nitro/h3";
import { getPriceHistory } from "@/modules/products/application/queries/get-price-history.query";
import { SqlitePriceHistoryRepository } from "@server/infrastructure/persistence/products/price-history.repository";

const priceHistoryRepo = new SqlitePriceHistoryRepository();

export default defineHandler(async (event) => {
  const productId = getRouterParam(event, "id");
  const result = await getPriceHistory({ productId }, { priceHistoryRepo });
  if (!result.success) {
    throw createError({ statusCode: 500, statusMessage: result.error });
  }
  return result.history.map((h) => h.toData());
});