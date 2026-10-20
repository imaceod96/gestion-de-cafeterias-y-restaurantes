import { Unit } from "../../domain/entities/unit";
import { UnitRepository } from "../ports/unit.repository";
import { ID } from "../../../../shared/types";

export type CreateUnitCommand = {
  name: string;
  abbreviation: string;
  isActive?: boolean;
};

export type UpdateUnitCommand = {
  id: ID;
  name?: string;
  abbreviation?: string;
  isActive?: boolean;
};

export type UnitResult = {
  unit: Unit | null;
  success: boolean;
  error?: string;
};

export const createUnit = async (
  command: CreateUnitCommand,
  deps: { unitRepo: UnitRepository }
): Promise<UnitResult> => {
  try {
    if (!command.name?.trim()) {
      return { unit: null, success: false, error: "El nombre es obligatorio" };
    }
    if (!command.abbreviation?.trim()) {
      return { unit: null, success: false, error: "La abreviatura es obligatoria" };
    }
    const unit = Unit.create({
      name: command.name.trim(),
      abbreviation: command.abbreviation.trim(),
      isActive: command.isActive ?? true,
    });
    await deps.unitRepo.save(unit);
    return { unit, success: true };
  } catch (error: any) {
    return { unit: null, success: false, error: error.message || "Error creando unidad" };
  }
};

export const updateUnit = async (
  command: UpdateUnitCommand,
  deps: { unitRepo: UnitRepository }
): Promise<UnitResult> => {
  try {
    const existing = await deps.unitRepo.findById(command.id);
    if (!existing) {
      return { unit: null, success: false, error: "Unidad no encontrada" };
    }
    const data = existing.toData();
    const unit = Unit.create({
      id: data.id,
      name: command.name?.trim() ?? data.name,
      abbreviation: command.abbreviation?.trim() ?? data.abbreviation,
      isActive: command.isActive ?? data.isActive,
      createdAt: data.createdAt,
      updatedAt: new Date().toISOString(),
    });
    await deps.unitRepo.save(unit);
    return { unit, success: true };
  } catch (error: any) {
    return { unit: null, success: false, error: error.message || "Error actualizando unidad" };
  }
};

export const deleteUnit = async (
  id: ID,
  deps: { unitRepo: UnitRepository }
): Promise<UnitResult> => {
  try {
    await deps.unitRepo.delete(id);
    return { unit: null, success: true };
  } catch (error: any) {
    return { unit: null, success: false, error: error.message || "Error eliminando unidad" };
  }
};