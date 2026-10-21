import { TableAccount } from "../../domain/entities/table-account";
import { TableAccountRepository } from "../ports/table-account.repository";
import { TableRepository } from "../ports/table.repository";
import { Table } from "../../domain/entities/table";
import { ID } from "../../../../shared/types";

export type CreateTableAccountCommand = {
  tableId: ID;
  name?: string | null;
};

export type CreateTableAccountResult = {
  account: TableAccount | null;
  table: Table | null;
  success: boolean;
  error?: string;
};

export const createTableAccount = async (
  command: CreateTableAccountCommand,
  deps: { tableAccountRepo: TableAccountRepository; tableRepo: TableRepository }
): Promise<CreateTableAccountResult> => {
  try {
    const { tableId, name } = command;

    // Check if table exists
    const table = await deps.tableRepo.findById(tableId);
    if (!table) {
      return { account: null, table: null, success: false, error: "Mesa no encontrada" };
    }

    // Check if table already has an open account
    const existingAccount = await deps.tableAccountRepo.findByTableId(tableId);
    if (existingAccount) {
      return { account: null, table: table, success: false, error: "La mesa ya tiene una cuenta abierta" };
    }

    // Create a new table account
    const account = TableAccount.create({
      tableId,
      status: "abierta",
      total: 0,
      totalCost: 0,
      itemCount: 0,
      openedAt: new Date().toISOString(),
    });

    const savedAccount = await deps.tableAccountRepo.save(account);

    // Update table to have current account
    const updatedTable = table.open(savedAccount.id.toString());
    await deps.tableRepo.save(updatedTable);

    return { account: savedAccount, table, success: true };
  } catch (error: any) {
    return { account: null, table: null, success: false, error: error.message || "Error creando cuenta de mesa" };
  }
};