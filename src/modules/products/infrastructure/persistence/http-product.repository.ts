import { Product } from "../../domain/entities/product";
import { ProductRepository } from "../../application/ports/product.repository";
import { ID } from "../../../shared/types";

export class HttpProductRepository implements ProductRepository {
  private baseUrl = "/api/products";

  async findAll(activeOnly = true): Promise<Product[]> {
    const res = await fetch(`${this.baseUrl}?activeOnly=${activeOnly}`);
    if (!res.ok) throw new Error("Error obteniendo productos");
    const data = await res.json();
    return data.map ( (row: any) => Product.fromData({
      id: row.id,
      categoryId: row.categoryId,
      name: row.name,
      description: row.description,
      unit: row.unit,
      currentPurchasePrice: row.currentPurchasePrice,
      currentSalePrice: row.currentSalePrice,
      currentStock: row.currentStock,
      minStock: row.minStock,
      isActive: row.isActive,
      photoUrl: row.photoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async findById(id: ID): Promise<Product | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Error obteniendo producto");
    const row = await res.json();
    return Product.fromData({
      id: row.id,
      categoryId: row.categoryId,
      name: row.name,
      description: row.description,
      unit: row.unit,
      currentPurchasePrice: row.currentPurchasePrice,
      currentSalePrice: row.currentSalePrice,
      currentStock: row.currentStock,
      minStock: row.minStock,
      isActive: row.isActive,
      photoUrl: row.photoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findByName(name: string): Promise<Product | null> {
    const res = await fetch(`${this.baseUrl}?name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Error buscando producto");
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const row = data[0];
    return Product.fromData({
      id: row.id,
      categoryId: row.categoryId,
      name: row.name,
      description: row.description,
      unit: row.unit,
      currentPurchasePrice: row.currentPurchasePrice,
      currentSalePrice: row.currentSalePrice,
      currentStock: row.currentStock,
      minStock: row.minStock,
      isActive: row.isActive,
      photoUrl: row.photoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(product: Product): Promise<Product> {
    const data = product.toData();
    const res = await fetch(`${this.baseUrl}/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        unit: data.unit,
        categoryId: data.categoryId,
        currentPurchasePrice: data.currentPurchasePrice,
        currentSalePrice: data.currentSalePrice,
        minStock: data.minStock,
        isActive: data.isActive,
      }),
    });
    if (!res.ok) throw new Error("Error guardando producto");
    const row = await res.json();
    return Product.fromData({
      id: row.id,
      categoryId: row.categoryId,
      name: row.name,
      description: row.description,
      unit: row.unit,
      currentPurchasePrice: row.currentPurchasePrice,
      currentSalePrice: row.currentSalePrice,
      currentStock: row.currentStock,
      minStock: row.minStock,
      isActive: row.isActive,
      photoUrl: row.photoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async delete(id: ID): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando producto");
  }
}