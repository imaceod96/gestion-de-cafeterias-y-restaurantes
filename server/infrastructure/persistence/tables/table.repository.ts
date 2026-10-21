import { getDatabase } from "@server/infrastructure/database/client";
import { Table } from "@/modules/tables/domain/entities/table";
import { TableRepository } from "@/modules/tables/application/ports/table.repository";
import { ID } from "@/shared/types";

export class SqliteTableRepository implements TableRepository {
  async findAll(): Promise<Table[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM tables ORDER BY number")
      .all() as any[];
    return rows.map((row) =>
      Table.fromData({
        id: row.id,
        number: row.number,
        name: row.name,
        status: row.status,
        currentAccountId: row.current_account_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    );
  }

  async findOpen(): Promise<Table[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM tables WHERE status = 'abierta' ORDER BY number")
      .all() as any[];
    return rows.map((row) =>
      Table.fromData({
        id: row.id,
        number: row.number,
        name: row.name,
        status: row.status,
        currentAccountId: row.current_account_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    );
  }

  async findById(id: ID): Promise<Table | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM tables WHERE id = ?").get(id) as any | undefined;
    if (!row) return null;
    return Table.fromData({
      id: row.id,
      number: row.number,
      name: row.name,
      status: row.status,
      currentAccountId: row.current_account_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async save(table: Table): Promise<Table> {
    const db = getDatabase();
    const data = table.toData();
    db.prepare(
      `INSERT INTO tables (id, number, name, status, current_account_id, created_at, updated_at)
       VALUES (@id, @number, @name, @status, @currentAccountId, @createdAt, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET
         number = @number,
         name = @name,
         status = @status,
         current_account_id = @currentAccountId,
         updated_at = @updatedAt`
    ).run({
      id: data.id,
      number: data.number,
      name: data.name,
      status: data.status,
      currentAccountId: data.currentAccountId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return table;
  }
}