import { getDatabase } from "@/server/infrastructure/database/client";
import { MerchandiseEntry } from "@/modules/warehouse/domain/entities/merchandise-entry";
import { MerchandiseEntryRepository } from "@/modules/warehouse/application/ports/merchandise-entry.repository";
import { ID } from "@/shared/types";

export class SqliteMerchandiseEntryRepository implements MerchandiseEntryRepository {
  async findAll(productId?: ID): Promise<MerchandiseEntry[]> {
    const db = getDatabase();
    const rows = productId
      ? (db.prepare("SELECT * FROM merchandise_entries WHERE product_id = ? ORDER BY entry_date DESC").all(productId) as any[])
      : (db.prepare("SELECT * FROM merchandise_entries ORDER BY entry_date DESC").all() as any[]);
    return rows.map((row) =>
      MerchandiseEntry.fromData({
        id: row.id,
        productId: row.product_id,
        quantity: row.quantity,
        unitCost: row.unit_cost,
        totalCost: row.total_cost,
        supplier: row.supplier,
        notes: row.notes,
        entryDate: row.entry_date,
        createdAt: row.created_at,
      })
    );
  }

  async findById(id: ID): Promise<MerchandiseEntry | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM merchandise_entries WHERE id = ?").get(id) as any | undefined;
    if (!row) return null;
    return MerchandiseEntry.fromData({
      id: row.id,
      productId: row.product_id,
      quantity: row.quantity,
      unitCost: row.unit_cost,
      totalCost: row.total_cost,
      supplier: row.supplier,
      notes: row.notes,
      entryDate: row.entry_date,
      createdAt: row.created_at,
    });
  }

  async save(entry: MerchandiseEntry): Promise<MerchandiseEntry> {
    const db = getDatabase();
    const data = entry.toData();
    db.prepare(
      `INSERT INTO merchandise_entries (id, product_id, quantity, unit_cost, total_cost, supplier, notes, entry_date, created_at)
       VALUES (@id, @productId, @quantity, @unitCost, @totalCost, @supplier, @notes, @entryDate, @createdAt)`
    ).run({
      id: data.id,
      productId: data.productId,
      quantity: data.quantity,
      unitCost: data.unitCost,
      totalCost: data.totalCost,
      supplier: data.supplier,
      notes: data.notes,
      entryDate: data.entryDate,
      createdAt: data.createdAt,
    });
    return entry;
  }

  async delete(id: ID): Promise<void> {
    const db = getDatabase();
    db.prepare("DELETE FROM merchandise_entries WHERE id = ?").run(id);
  }
}
