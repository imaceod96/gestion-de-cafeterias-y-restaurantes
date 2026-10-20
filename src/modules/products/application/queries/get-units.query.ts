import { Unit } from "../../domain/entities/unit";
import { UnitRepository } from "../ports/unit.repository";

export type GetUnitsResult = {
  units: Unit[];
  success: boolean;
  error?: string;
};

export const getUnits = async (deps: {
  unitRepo: UnitRepository;
}): Promise<GetUnitsResult> => {
  try {
    const units = await deps.unitRepo.findAll();
    return { units, success: true };
  } catch (error: any) {
    return { units: [], success: false, error: error.message || "Error obteniendo unidades" };
  }
};