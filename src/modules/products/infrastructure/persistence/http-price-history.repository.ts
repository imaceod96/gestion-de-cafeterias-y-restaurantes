import { PriceHistory } from "../../domain/entities/price-history";
import { PriceHistoryRepository } from "../../application/ports/price-history.repository";
import { ID } from "../../../../shared/types";

export class HttpPriceHistoryRepository implements PriceHistoryRepository {
  async findByProduct(productId: ID): Promise<PriceHistory[]> {
    const res = await fetch(`/api/products/${productId}/price-history`);
    if (!res.ok) throw new Error("Error obteniendo historial de precios");
    const data = await res.json();
    return data.map((row: any) => PriceHistory.fromData({
      id: row.id,
      productId: row.productId,
      priceType: row.priceType,
      oldPrice: row.oldPrice,
      newPrice: row.newPrice,
      changedBy: row.changedBy,
      changeDate: row.changeDate,
      createdAt: row.createdAt,
    }));
  }

  async save(entry: PriceHistory): Promise<PriceHistory> {
    throw new Error("Price history is read-only from the client");
  }
}