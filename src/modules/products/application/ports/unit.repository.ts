import { Unit } from "../../domain/entities/unit";
import { ID } from "../../../../shared/types";

export interface UnitRepository {
  findAll(): Promise<Unit[]>;
  findById(id: ID): Promise<Unit | null>;
  save(unit: Unit): Promise<Unit>;
  delete(id: ID): Promise<void>;
}