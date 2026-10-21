import { getDatabase } from "@server/infrastructure/database/client";
import { TableAccount } from "@/modules/tables/domain/entities/table-account";
import { TableAccountDetail } from "@/modules/tables/domain/entities/table-account";
import { TableAccountRepository } from "@/modules/tables/application/ports/table-account.repository";
import { ID } from "@/shared/types";

export class SqliteTableAccountRepository implements TableAccountRepository {
  async findAll(): Promise<TableAccount[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM table_accounts ORDER BY opened_at DESC")
      .all() as any[];
    return rows.map((row) => {
      const details = this.getDetails(row.id);
      return TableAccount.fromData(
        {
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
        },
        details
      );
    });
  }

  async findOpen(): Promise<TableAccount[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM table_accounts WHERE status = 'abierta' ORDER BY opened_at DESC")
      .all() as any[];
    return rows.map((row) => {
      const details = this.getDetails(row.id);
      return TableAccount.fromData(
        {
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
        },
        details
      );
    });
  }

  async findById(id: ID): Promise<TableAccount | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM table_accounts WHERE id = ?").get(id) as any | undefined;
    if (!row) return null;
    const details = this.getDetails(id);
    return TableAccount.fromData(
      {
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
      },
      details
    );
  }

  async findByTableId(tableId: ID): Promise<TableAccount | null> {
    const db = getDatabase();
    const row = db
      .prepare("SELECT * FROM table_accounts WHERE table_id = ? AND status = 'abierta' ORDER BY opened_at DESC LIMIT 1")
      .get(tableId) as any | undefined;
    if (!row) return null;
    const details = this.getDetails(row.id);
    return TableAccount.fromData(
      {
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
      },
      details
    );
  }

  async save(account: TableAccount): Promise<TableAccount> {
    const db = getDatabase();
    const data = account.toData();
    db.prepare(
      `INSERT INTO table_accounts (id, table_id, status, total, total_cost, item_count, opened_at, sale_id, closed_at, created_at, updated_at)
       VALUES (@id, @tableId, @status, @total, @totalCost, @itemCount, @openedAt, @saleId, @closedAt, @createdAt, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET
         table_id = @tableId,
         status = @status,
         total = @total,
         total_cost = @totalCost,
         item_count = @itemCount,
         opened_at = @openedAt,
         sale_id = @saleId,
         closed_at = @closedAt,
         updated_at = @updatedAt`
    ).run({
      id: data.id,
      tableId: data.tableId,
      status: data.status,
      total: data.total,
      totalCost: data.totalCost,
      itemCount: data.itemCount,
      openedAt: data.openedAt,
      saleId: data.saleId,
      closedAt: data.closedAt,
      createdAt: data.createdAt,
      updatedAt: new Date().toISOString(),
    });

    // Save details
    for (const detail of account.details) {
      this.saveDetail(detail);
    }

    return account;
  }

  private getDetails(accountId: ID): TableAccountDetail[] {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM table_account_details WHERE account_id = ? ORDER BY added_at ASC")
      .all(accountId) as any[];
    return rows.map((row) =>
      TableAccountDetail.fromData({
        id: row.id,
        accountId: row.account_id,
        productId: row.product_id,
        productName: row.product_name,
        quantity: row.quantity,
        unitSalePrice: row.unit_sale_price,
        unitCost: row.unit_cost,
        total: row.total,
        addedAt: row.added_at,
        createdAt: row.created_at,
      })
    );
  }

  private saveDetail(detail: TableAccountDetail): void {
    const db = getDatabase();
    const data = detail.toData();
    db.prepare(
      `INSERT INTO table_account_details (id, account_id, product_id, product_name, quantity, unit_sale_price, unit_cost, total, added_at, created_at)
       VALUES (@id, @accountId, @productId, @productName, @quantity, @unitSalePrice, @unitCost, @total, @addedAt, @createdAt)
       ON CONFLICT(id) DO UPDATE SET
         account_id = @accountId,
         product_id = @productId,
         product_name = @productName,
         quantity = @quantity,
         unit_sale_price = @unitSalePrice,
         unit_cost = @unitCost,
         total = @total,
         added_at = @addedAt,
         created_at = @createdAt`
    ).run({
      id: data.id,
      accountId: data.accountId,
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      unitSalePrice: data.unitSalePrice,
      unitCost: data.unitCost,
      total: data.total,
      addedAt: data.addedAt,
      createdAt: data.createdAt,
    });
  }
}