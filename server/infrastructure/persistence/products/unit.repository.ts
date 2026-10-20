import { getDatabase } from "@server/infrastructure/database/client";
import { Unit } from "@/modules/products/domain/entities/unit";
import { UnitRepository } from "@/modules/products/application/ports/unit.repository";
import { ID } from "@/shared/types";

export class SqliteUnitRepository implements UnitRepository {
  async findAll(): Promise<Unit[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM units ORDER BY name").all() as any[];
    return rows.map((row) =>
      Unit.fromData({
        id: row.id,
        name: row.name,
        abbreviation: row.abbreviation,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    );
  }

  async findById(id: ID): Promise<Unit | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM units WHERE id = ?").get(id) as any | undefined;
    if (!row) return null;
    return Unit.fromData({
      id: row.id,
      name: row.name,
      abbreviation: row.abbreviation,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async save(unit: Unit): Promise<Unit> {
    const db = getDatabase();
    const data = unit.toData();
    db.prepare(
      `INSERT INTO units (id, name, abbreviation, is_active, created_at, updated_at)
       VALUES (@id, @name, @abbreviation, @isActive, @createdAt, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET
         name = @name,
         abbreviation = @abbreviation,
         is_active = @isActive,
         updated_at = @updatedAt`
    ).run({
      id: data.id,
      name: data.name,
      abbreviation: data.abbreviation,
      isActive: data.isActive ? 1 : 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return unit;
  }

  async delete(id: ID): Promise<void> {
    const db = getDatabase();
    db.prepare("DELETE FROM units WHERE id = ?").run(id);
  }
}