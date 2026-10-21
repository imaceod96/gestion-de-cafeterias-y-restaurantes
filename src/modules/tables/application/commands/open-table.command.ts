import { TableAccount } from "../../domain/entities/table-account";
import { Table } from "../../domain/entities/table";
import { TableAccountRepository } from "../ports/table-account.repository";
import { TableRepository } from "../ports/table.repository";
import { ID } from "../../../../shared/types";

export type OpenTableCommand = {
  number: number;
  name: string;
};

export type OpenTableResult = {
  table: Table | null;
  account: TableAccount | null;
  success: boolean;
  error?: string;
};

export const openTable = async (
  command: OpenTableCommand,
  deps: { tableRepo: TableRepository; tableAccountRepo: TableAccountRepository }
): Promise<OpenTableResult> => {
  try {
    const { number, name } = command;

    if (!number || number < 1) {
      return { table: null, account: null, success: false, error: "El número de mesa es obligatorio" };
    }

    if (!name.trim()) {
      return { table: null, account: null, success: false, error: "El nombre es obligatorio" };
    }

    const existingTables = await deps.tableRepo.findAll();
    const duplicate = existingTables.find((t) => t.number === number);
    if (duplicate) {
      return { table: null, account: null, success: false, error: `Ya existe la mesa número ${number}` };
    }

    // Create the table
    const table = Table.create({
      number,
      name: name.trim(),
      status: "abierta",
    });
    const savedTable = await deps.tableRepo.save(table);

    // Open its account immediately
    const account = TableAccount.create({
      tableId: savedTable.id.toString(),
      status: "abierta",
      total: 0,
      totalCost: 0,
      itemCount: 0,
      openedAt: new Date().toISOString(),
    });
    const savedAccount = await deps.tableAccountRepo.save(account);

    // Link the table to its open account
    await deps.tableRepo.save(savedTable.open(savedAccount.id.toString()));

    return { table: savedTable, account: savedAccount, success: true };
  } catch (error: any) {
    return { table: null, account: null, success: false, error: error.message || "Error abriendo mesa" };
  }
};