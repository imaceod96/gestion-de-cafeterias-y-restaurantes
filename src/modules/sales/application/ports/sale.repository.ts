import { Sale } from "../../domain/entities/sale";
import { ID } from "../../../../shared/types";

export interface SaleRepository {
  findAll(): Promise<Sale[]>;
  findById(id: ID): Promise<Sale | null>;
  save(sale: Sale): Promise<Sale>;
}