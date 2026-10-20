import { MerchandiseEntry } from "../../domain/entities/merchandise-entry";
import { ID } from "../../../../shared/types";

export interface MerchandiseEntryRepository {
  findAll(productId?: ID): Promise<MerchandiseEntry[]>;
  findById(id: ID): Promise<MerchandiseEntry | null>;
  save(entry: MerchandiseEntry): Promise<MerchandiseEntry>;
  delete(id: ID): Promise<void>;
}