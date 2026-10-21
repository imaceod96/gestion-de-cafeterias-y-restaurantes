import { Table } from "../../domain/entities/table";
import { ID } from "../../../../shared/types";

export interface TableRepository {
  findAll(): Promise<Table[]>;
  findOpen(): Promise<Table[]>;
  findById(id: ID): Promise<Table | null>;
  save(table: Table): Promise<Table>;
}