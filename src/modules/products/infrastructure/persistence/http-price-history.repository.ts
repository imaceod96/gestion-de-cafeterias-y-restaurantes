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
    const data = entry.toData();
    const res = await fetch(`/api/products/${data.productId}/price-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error guardando historial de precios");
    return entry;
  }
}