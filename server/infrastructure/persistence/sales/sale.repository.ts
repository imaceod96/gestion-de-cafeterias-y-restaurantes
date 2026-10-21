import { getDatabase } from "@server/infrastructure/database/client";
import { Sale, SaleDetail } from "@/modules/sales/domain/entities/sale";
import { SaleRepository } from "@/modules/sales/application/ports/sale.repository";
import { ID } from "@/shared/types";

export class SqliteSaleRepository implements SaleRepository {
  async findAll(): Promise<Sale[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM sales ORDER BY sale_date DESC")
      .all() as any[];
    return rows.map((row) => {
      const details = this.getDetails(row.id);
      return Sale.fromData(
        {
          id: row.id,
          origin: row.origin,
          originId: row.origin_id,
          total: row.total,
          totalCost: row.total_cost,
          totalProfit: row.total_profit,
          itemCount: row.item_count,
          saleDate: row.sale_date,
          createdAt: row.created_at,
        },
        details
      );
    });
  }

  async findById(id: ID): Promise<Sale | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM sales WHERE id = ?").get(id) as any | undefined;
    if (!row) return null;
    const details = this.getDetails(id);
    return Sale.fromData(
      {
        id: row.id,
        origin: row.origin,
        originId: row.origin_id,
        total: row.total,
        totalCost: row.total_cost,
        totalProfit: row.total_profit,
        itemCount: row.item_count,
        saleDate: row.sale_date,
        createdAt: row.created_at,
      },
      details
    );
  }

  async save(sale: Sale): Promise<Sale> {
    const db = getDatabase();
    const data = sale.toData();
    db.prepare(
      `INSERT INTO sales (id, origin, origin_id, total, total_cost, total_profit, item_count, sale_date, created_at, updated_at)
       VALUES (@id, @origin, @originId, @total, @totalCost, @totalProfit, @itemCount, @saleDate, @createdAt, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET
         origin = @origin,
         origin_id = @originId,
         total = @total,
         total_cost = @totalCost,
         total_profit = @totalProfit,
         item_count = @itemCount,
         sale_date = @saleDate,
         updated_at = @updatedAt`
    ).run({
      id: data.id,
      origin: data.origin,
      originId: data.originId,
      total: data.total,
      totalCost: data.totalCost,
      totalProfit: data.totalProfit,
      itemCount: data.itemCount,
      saleDate: data.saleDate,
      createdAt: data.createdAt,
      updatedAt: new Date().toISOString(),
    });

    // Save details
    for (const detail of sale.details) {
      this.saveDetail(detail);
    }

    return sale;
  }

  private getDetails(saleId: ID): SaleDetail[] {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM sale_details WHERE sale_id = ? ORDER BY created_at ASC")
      .all(saleId) as any[];
    return rows.map((row) =>
      SaleDetail.fromData({
        id: row.id,
        saleId: row.sale_id,
        productId: row.product_id,
        productName: row.product_name,
        quantity: row.quantity,
        unitSalePrice: row.unit_sale_price,
        unitCost: row.unit_cost,
        total: row.total,
        createdAt: row.created_at,
      })
    );
  }

  private saveDetail(detail: SaleDetail): void {
    const db = getDatabase();
    const data = detail.toData();
    db.prepare(
      `INSERT INTO sale_details (id, sale_id, product_id, product_name, quantity, unit_sale_price, unit_cost, total, created_at)
       VALUES (@id, @saleId, @productId, @productName, @quantity, @unitSalePrice, @unitCost, @total, @createdAt)
       ON CONFLICT(id) DO UPDATE SET
         sale_id = @saleId,
         product_id = @productId,
         product_name = @productName,
         quantity = @quantity,
         unit_sale_price = @unitSalePrice,
         unit_cost = @unitCost,
         total = @total,
         created_at = @createdAt`
    ).run({
      id: data.id,
      saleId: data.saleId,
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      unitSalePrice: data.unitSalePrice,
      unitCost: data.unitCost,
      total: data.total,
      createdAt: data.createdAt,
    });
  }
}