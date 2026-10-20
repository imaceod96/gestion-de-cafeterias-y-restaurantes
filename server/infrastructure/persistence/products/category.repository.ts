import { getDatabase } from "@server/infrastructure/database/client";
import { Category } from "@/modules/products/domain/entities/category";
import { CategoryRepository } from "@/modules/products/application/ports/product.repository";
import { ID } from "@/shared/types";

export class SqliteCategoryRepository implements CategoryRepository {
  async findAll(): Promise<Category[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM categories WHERE is_active = 1 ORDER BY name").all() as any[];
    return rows.map((row) =>
      Category.fromData({
        id: row.id,
        name: row.name,
        description: row.description,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    );
  }

  async findById(id: ID): Promise<Category | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as any | undefined;
    if (!row) return null;
    return Category.fromData({
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async save(category: Category): Promise<Category> {
    const db = getDatabase();
    const data = category.toData();
    db.prepare(
      `INSERT INTO categories (id, name, description, is_active, created_at, updated_at)
       VALUES (@id, @name, @description, @isActive, @createdAt, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET
         name = @name,
         description = @description,
         is_active = @isActive,
         updated_at = @updatedAt`
    ).run({
      id: data.id,
      name: data.name,
      description: data.description,
      isActive: data.isActive ? 1 : 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return category;
  }

  async delete(id: ID): Promise<void> {
    const db = getDatabase();
    db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  }
}