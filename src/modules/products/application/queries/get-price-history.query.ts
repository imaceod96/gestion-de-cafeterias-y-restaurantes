import { PriceHistory } from "../../domain/entities/price-history";
import { PriceHistoryRepository } from "../ports/price-history.repository";
import { ID } from "../../../../shared/types";

export type GetPriceHistoryQuery = {
  productId: ID;
};

export type GetPriceHistoryResult = {
  history: PriceHistory[];
  success: boolean;
  error?: string;
};

export const getPriceHistory = async (
  query: GetPriceHistoryQuery,
  deps: { priceHistoryRepo: PriceHistoryRepository }
): Promise<GetPriceHistoryResult> => {
  try {
    const history = await deps.priceHistoryRepo.findByProduct(query.productId);
    return { history, success: true };
  } catch (error: any) {
    return { history: [], success: false, error: error.message || "Error obteniendo historial de precios" };
  }
};