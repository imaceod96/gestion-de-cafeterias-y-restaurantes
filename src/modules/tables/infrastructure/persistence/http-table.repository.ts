import { Table } from "../../domain/entities/table";
import { TableRepository } from "../../application/ports/table.repository";
import { ID } from "../../../../shared/types";

export class HttpTableRepository implements TableRepository {
  async findAll(): Promise<Table[]> {
    const res = await fetch("/api/tables");
    if (!res.ok) throw new Error("Error obteniendo mesas");
    const data = await res.json();
    return data.map((row: any) => Table.fromData({
      id: row.id,
      number: row.number,
      name: row.name,
      status: row.status,
      currentAccountId: row.current_account_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async findOpen(): Promise<Table[]> {
    const res = await fetch("/api/tables?open=true");
    if (!res.ok) throw new Error("Error obteniendo mesas abiertas");
    const data = await res.json();
    return data.map((row: any) => Table.fromData({
      id: row.id,
      number: row.number,
      name: row.name,
      status: row.status,
      currentAccountId: row.current_account_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async findById(id: ID): Promise<Table | null> {
    const res = await fetch(`/api/tables/${id}`);
    if (!res.ok) throw new Error("Error obteniendo mesa");
    const data = await res.json();
    return Table.fromData({
      id: data.id,
      number: data.number,
      name: data.name,
      status: data.status,
      currentAccountId: data.current_account_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }

  async save(table: Table): Promise<Table> {
    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(table.toData()),
    });
    if (!res.ok) throw new Error("Error creando mesa");
    const data = await res.json();
    return Table.fromData({
      id: data.id,
      number: data.number,
      name: data.name,
      status: data.status,
      currentAccountId: data.current_account_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }
}