import { PriceHistory } from "../../domain/entities/price-history";
import { PriceHistoryRepository } from "../ports/price-history.repository";
import { ID } from "../../../../shared/types";

export class HttpPriceHistoryRepository implements PriceHistoryRepository {
  async findByProduct(productId: ID): Promise<PriceHistory[]> {
    const res = await fetch(`/api/products/${productId}/price-history`);
    if (!res.ok) throw new Error("Error obteniendo historial de precios");
    const data = await res.json();
    return data.map((row: any) => PriceHistory.fromData({
      id: row.id,
      productId: row.product_id,
      priceType: row.price_type,
      oldPrice: row.old_price,
      newPrice: row.new_price,
      changedBy: row.changed_by,
      changeDate: row.change_date,
      createdAt: row.created_at,
    }));
  }

  async save(entry: PriceHistory): Promise<PriceHistory> {
    throw new Error("Price history is read-only from the client");
  }
}