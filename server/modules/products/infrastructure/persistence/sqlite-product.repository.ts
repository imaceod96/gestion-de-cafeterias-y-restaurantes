import { getDatabase } from "@/server/infrastructure/database/client";
import { Product } from "@/modules/products/domain/entities/product";
import { ProductRepository } from "@/modules/products/application/ports/product.repository";
import { ID } from "@/shared/types";

export class SqliteProductRepository implements ProductRepository {
  async findAll(activeOnly = true): Promise<Product[]> {
    const db = getDatabase();
    const rows = db
      .prepare(activeOnly ? "SELECT * FROM products WHERE is_active = 1 ORDER BY name" : "SELECT * FROM products ORDER BY name")
      .all() as any[];
    return rows.map((row) =>
      Product.fromData({
        id: row.id,
        categoryId: row.category_id,
        name: row.name,
        description: row.description,
        unit: row.unit,
        currentPurchasePrice: row.current_purchase_price,
        currentSalePrice: row.current_sale_price,
        currentStock: row.current_stock,
        minStock: row.min_stock,
        isActive: Boolean(row.is_active),
        photoUrl: row.photo_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    );
  }

  async findById(id: ID): Promise<Product | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as any | undefined;
    if (!row) return null;
    return Product.fromData({
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      unit: row.unit,
      currentPurchasePrice: row.current_purchase_price,
      currentSalePrice: row.current_sale_price,
      currentStock: row.current_stock,
      minStock: row.min_stock,
      isActive: Boolean(row.is_active),
      photoUrl: row.photo_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findByName(name: string): Promise<Product | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM products WHERE name = ?").get(name) as any | undefined;
    if (!row) return null;
    return Product.fromData({
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      unit: row.unit,
      currentPurchasePrice: row.current_purchase_price,
      currentSalePrice: row.current_sale_price,
      currentStock: row.current_stock,
      minStock: row.min_stock,
      isActive: Boolean(row.is_active),
      photoUrl: row.photo_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async save(product: Product): Promise<Product> {
    const db = getDatabase();
    const data = product.toData();
    db.prepare(
      `INSERT INTO products (id, category_id, name, description, unit, current_purchase_price, current_sale_price, current_stock, min_stock, is_active, photo_url, created_at, updated_at)
       VALUES (@id, @categoryId, @name, @description, @unit, @currentPurchasePrice, @currentSalePrice, @currentStock, @minStock, @isActive, @photoUrl, @createdAt, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET
         category_id = @categoryId,
         name = @name,
         description = @description,
         unit = @unit,
         current_purchase_price = @currentPurchasePrice,
         current_sale_price = @currentSalePrice,
         current_stock = @currentStock,
         min_stock = @minStock,
         is_active = @isActive,
         photo_url = @photoUrl,
         updated_at = @updatedAt`
    ).run({
      id: data.id,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      unit: data.unit,
      currentPurchasePrice: data.currentPurchasePrice,
      currentSalePrice: data.currentSalePrice,
      currentStock: data.currentStock,
      minStock: data.minStock,
      isActive: data.isActive ? 1 : 0,
      photoUrl: data.photoUrl,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return product;
  }

  async delete(id: ID): Promise<void> {
    const db = getDatabase();
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
  }
}
