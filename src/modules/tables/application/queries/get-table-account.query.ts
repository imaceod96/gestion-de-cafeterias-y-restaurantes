import { TableAccount } from "../../domain/entities/table-account";
import { TableAccountRepository } from "../ports/table-account.repository";
import { ID } from "../../../../shared/types";

export type GetTableAccountQuery = {
  accountId: ID;
};

export type GetTableAccountResult = {
  account: TableAccount | null;
  success: boolean;
  error?: string;
};

export const getTableAccount = async (
  query: GetTableAccountQuery,
  deps: { tableAccountRepo: TableAccountRepository }
): Promise<GetTableAccountResult> => {
  try {
    const { accountId } = query;
    const account = await deps.tableAccountRepo.findById(accountId);
    return { account, success: true };
  } catch (error: any) {
    return { account: null, success: false, error: error.message || "Error obteniendo cuenta de mesa" };
  }
};