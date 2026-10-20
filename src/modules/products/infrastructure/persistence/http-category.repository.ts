import { Category } from "../../domain/entities/category";
import { CategoryRepository } from "../../application/ports/product.repository";
import { ID } from "../../../shared/types";

export class HttpCategoryRepository implements CategoryRepository {
  private baseUrl = "/api/categories";

  async findAll(): Promise<Category[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error("Error obteniendo categorías");
    const data = await res.json();
    return data.map((row: any) => Category.fromData({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async findById(id: ID): Promise<Category | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Error obteniendo categoría");
    const row = await res.json();
    return Category.fromData({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(category: Category): Promise<Category> {
    const data = category.toData();
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, description: data.description }),
    });
    if (!res.ok) throw new Error("Error guardando categoría");
    const row = await res.json();
    return Category.fromData({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async delete(id: ID): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando categoría");
  }
}