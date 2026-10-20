import { Unit } from "../../domain/entities/unit";
import { UnitRepository } from "../../application/ports/unit.repository";
import { ID } from "../../../../shared/types";

export class HttpUnitRepository implements UnitRepository {
  private baseUrl = "/api/units";

  async findAll(): Promise<Unit[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error("Error obteniendo unidades");
    const data = await res.json();
    return data.map((row: any) => Unit.fromData(row));
  }

  async findById(id: ID): Promise<Unit | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Error obteniendo unidad");
    return Unit.fromData(await res.json());
  }

  async save(unit: Unit): Promise<Unit> {
    const data = unit.toData();
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: data.id,
        name: data.name,
        abbreviation: data.abbreviation,
        isActive: data.isActive,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.statusMessage || "Error guardando unidad");
    }
    return Unit.fromData(await res.json());
  }

  async delete(id: ID): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando unidad");
  }
}