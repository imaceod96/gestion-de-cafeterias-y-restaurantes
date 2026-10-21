import { TableAccount } from "../../domain/entities/table-account";
import { TableAccountDetail } from "../../domain/entities/table-account";
import { ID } from "../../../../shared/types";

export interface TableAccountRepository {
  findAll(): Promise<TableAccount[]>;
  findOpen(): Promise<TableAccount[]>;
  findById(id: ID): Promise<TableAccount | null>;
  save(account: TableAccount): Promise<TableAccount>;
  findByTableId(tableId: ID): Promise<TableAccount | null>;
}