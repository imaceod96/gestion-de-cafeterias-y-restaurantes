import { TableRepository } from "../ports/table.repository";
import { Table } from "../../domain/entities/table";
import { ID } from "../../../../shared/types";

export type CreateTableCommand = {
  number: number;
  name: string | null;
};

export type CreateTableResult = {
  table: Table | null;
  success: boolean;
  error?: string;
};

export const createTable = async (
  command: CreateTableCommand,
  deps: { tableRepo: TableRepository }
): Promise<CreateTableResult> => {
  try {
    const table = Table.create({
      number: command.number,
      name: command.name,
      status: "abierta",
    });
    const saved = await deps.tableRepo.save(table);
    return { table: saved, success: true };
  } catch (error: any) {
    return { table: null, success: false, error: error.message || "Error creando mesa" };
  }
};