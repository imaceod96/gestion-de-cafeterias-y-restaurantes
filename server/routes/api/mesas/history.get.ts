import { defineHandler } from "nitro";
import { getDatabase } from "@server/infrastructure/database/client";
import { TableAccount } from "@/modules/tables/domain/entities/table-account";
import { TableAccountDetail } from "@/modules/tables/domain/entities/table-account";

export default defineHandler(async (event) => {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT ta.*, t.number AS table_number, t.name AS table_name
       FROM table_accounts ta
       LEFT JOIN tables t ON t.id = ta.table_id
       WHERE ta.status = 'cerrada'
       ORDER BY ta.closed_at DESC`
    )
    .all() as any[];

  return rows.map((row) => {
    const detailRows = db
      .prepare("SELECT * FROM table_account_details WHERE account_id = ? ORDER BY added_at ASC")
      .all(row.id) as any[];
    const details = detailRows.map((d) =>
      TableAccountDetail.fromData({
        id: d.id,
        accountId: d.account_id,
        productId: d.product_id,
        productName: d.product_name,
        quantity: d.quantity,
        unitSalePrice: d.unit_sale_price,
        unitCost: d.unit_cost,
        total: d.total,
        addedAt: d.added_at,
        createdAt: d.created_at,
      }).toData()
    );

    const account = TableAccount.fromData({
      id: row.id,
      tableId: row.table_id,
      status: row.status,
      total: row.total,
      totalCost: row.total_cost,
      itemCount: row.item_count,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
      saleId: row.sale_id,
      createdAt: row.created_at,
    });

    return {
      id: account.id.toString(),
      tableId: account.tableId.toString(),
      tableNumber: row.table_number,
      tableName: row.table_name,
      status: account.status,
      total: account.total.toNumber(),
      totalCost: account.totalCost.toNumber(),
      totalProfit: account.total.toNumber() - account.totalCost.toNumber(),
      itemCount: account.itemCount,
      openedAt: account.openedAt.toISOString(),
      closedAt: account.closedAt?.toISOString() ?? null,
      createdAt: account.createdAt.toISOString(),
      details,
    };
  });
});