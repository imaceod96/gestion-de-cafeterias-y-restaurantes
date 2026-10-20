import { defineHandler } from "nitro";
import { readBody, getRouterParam } from "nitro/h3";
import { PriceHistory } from "@/modules/products/domain/entities/price-history";
import { SqlitePriceHistoryRepository } from "@server/infrastructure/persistence/products/price-history.repository";

const priceHistoryRepo = new SqlitePriceHistoryRepository();

export default defineHandler(async (event) => {
  const productId = getRouterParam(event, "id");
  const body = await readBody(event);
  const history = PriceHistory.fromData({
    id: body.id,
    productId,
    priceType: body.priceType,
    oldPrice: body.oldPrice,
    newPrice: body.newPrice,
    changedBy: body.changedBy ?? null,
    changeDate: body.changeDate,
    createdAt: body.createdAt,
  });
  await priceHistoryRepo.save(history);
  return { success: true };
});