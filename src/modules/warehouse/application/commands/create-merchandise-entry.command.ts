import { MerchandiseEntry } from "../../domain/entities/merchandise-entry";
import { MerchandiseEntryData } from "../../domain/entities/merchandise-entry";
import { EntityId } from "../../../shared/domain/value-objects";
import { ID } from "../../../shared/types";

export type CreateMerchandiseEntryCommand = {
  productId: ID;
  quantity: number;
  unitCost: number;
  supplier?: string | null;
  notes?: string | null;
  entryDate?: string;
};

export type CreateMerchandiseEntryResult = {
  entry: MerchandiseEntry;
  success: boolean;
  error?: string;
};

export const createMerchandiseEntry = async (
  command: CreateMerchandiseEntryCommand
): Promise<CreateMerchandiseEntryResult> => {
  try {
    const entry = MerchandiseEntry.create({
      id: EntityId.generate().toString(),
      productId: command.productId,
      quantity: command.quantity,
      unitCost: command.unitCost,
      supplier: command.supplier,
      notes: command.notes,
      entryDate: command.entryDate,
    });

    return {
      entry,
      success: true,
    };
  } catch (error: any) {
    return {
      entry: {} as MerchandiseEntry,
      success: false,
      error: error.message || "Error creating merchandise entry",
    };
  }
};