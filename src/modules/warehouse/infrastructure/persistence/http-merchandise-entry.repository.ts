import { MerchandiseEntry } from "../../domain/entities/merchandise-entry";
import { MerchandiseEntryRepository } from "../../application/ports/merchandise-entry.repository";
import { ID } from "../../../../shared/types";

export class HttpMerchandiseEntryRepository implements MerchandiseEntryRepository {
  private baseUrl = "/api/merchandise-entries";

  async findAll(productId?: ID): Promise<MerchandiseEntry[]> {
    const url = productId ? `${this.baseUrl}?productId=${productId}` : this.baseUrl;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error obteniendo entradas");
    const data = await res.json();
    return data.map((row: any) => MerchandiseEntry.fromData({
      id: row.id,
      productId: row.productId,
      quantity: row.quantity,
      unitCost: row.unitCost,
      totalCost: row.totalCost,
      supplier: row.supplier,
      notes: row.notes,
      entryDate: row.entryDate,
      createdAt: row.createdAt,
    }));
  }

  async findById(id: ID): Promise<MerchandiseEntry | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Error obteniendo entrada");
    const row = await res.json();
    return MerchandiseEntry.fromData({
      id: row.id,
      productId: row.productId,
      quantity: row.quantity,
      unitCost: row.unitCost,
      totalCost: row.totalCost,
      supplier: row.supplier,
      notes: row.notes,
      entryDate: row.entryDate,
      createdAt: row.createdAt,
    });
  }

  async save(entry: MerchandiseEntry): Promise<MerchandiseEntry> {
    const data = entry.toData();
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: data.productId,
        quantity: data.quantity,
        unitCost: data.unitCost,
        supplier: data.supplier,
        notes: data.notes,
        entryDate: data.entryDate,
      }),
    });
    if (!res.ok) throw new Error("Error guardando entrada");
    const row = await res.json();
    return MerchandiseEntry.fromData({
      id: row.id,
      productId: row.productId,
      quantity: row.quantity,
      unitCost: row.unitCost,
      totalCost: row.totalCost,
      supplier: row.supplier,
      notes: row.notes,
      entryDate: row.entryDate,
      createdAt: row.createdAt,
    });
  }

  async delete(id: ID): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando entrada");
  }
}