import { getDatabase } from "@server/infrastructure/database/client";
import { PriceHistory } from "../../domain/entities/price-history";
import { PriceHistoryRepository } from "../../application/ports/price-history.repository";
import { ID } from "../../../../shared/types";

export class SqlitePriceHistoryRepository implements PriceHistoryRepository {
  async findByProduct(productId: ID): Promise<PriceHistory[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM price_history WHERE product_id = ? ORDER BY change_date DESC")
      .all(productId) as any[];
    return rows.map((row) =>
      PriceHistory.fromData({
        id: row.id,
        productId: row.product_id,
        priceType: row.price_type,
        oldPrice: row.old_price,
        newPrice: row.new_price,
        changedBy: row.changed_by,
        changeDate: row.change_date,
        createdAt: row.created_at,
      })
    );
  }

  async save(entry: PriceHistory): Promise<PriceHistory> {
    const db = getDatabase();
    const data = entry.toData();
    db.prepare(
      `INSERT INTO price_history (id, product_id, price_type, old_price, new_price, changed_by, change_date, created_at)
       VALUES (@id, @productId, @priceType, @oldPrice, @newPrice, @changedBy, @changeDate, @createdAt)`
    ).run({
      id: data.id,
      productId: data.productId,
      priceType: data.priceType,
      oldPrice: data.oldPrice,
      newPrice: data.newPrice,
      changedBy: data.changedBy,
      changeDate: data.changeDate,
      createdAt: data.createdAt,
    });
    return entry;
  }
}