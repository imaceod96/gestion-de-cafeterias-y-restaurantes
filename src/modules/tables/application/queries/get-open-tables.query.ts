import { TableRepository } from "../ports/table.repository";
import { Table } from "../../domain/entities/table";
import { ID } from "../../../../shared/types";

export type GetOpenTablesQuery = {
  includeClosed?: boolean;
};

export type GetOpenTablesResult = {
  tables: Table[];
  total: number;
  success: boolean;
  error?: string;
};

export const getOpenTables = async (
  query: GetOpenTablesQuery = {},
  deps: { tableRepo: TableRepository }
): Promise<GetOpenTablesResult> => {
  try {
    const { includeClosed = false } = query;
    const tables = includeClosed
      ? await deps.tableRepo.findAll()
      : await deps.tableRepo.findOpen();
    return { tables, total: tables.length, success: true };
  } catch (error: any) {
    return { tables: [], total: 0, success: false, error: error.message || "Error obteniendo mesas" };
  }
};