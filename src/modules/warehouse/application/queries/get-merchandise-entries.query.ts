import { MerchandiseEntry } from "../../domain/entities/merchandise-entry";
import { MerchandiseEntryRepository } from "../ports/merchandise-entry.repository";
import { ID } from "../../../../shared/types";

export type GetMerchandiseEntriesQuery = {
  productId?: ID;
};

export type GetMerchandiseEntriesResult = {
  entries: MerchandiseEntry[];
  total: number;
  success: boolean;
  error?: string;
};

export const getMerchandiseEntries = async (
  query: GetMerchandiseEntriesQuery = {},
  deps: { entryRepo: MerchandiseEntryRepository }
): Promise<GetMerchandiseEntriesResult> => {
  try {
    const entries = await deps.entryRepo.findAll(query.productId);
    return { entries, total: entries.length, success: true };
  } catch (error: any) {
    return { entries: [], total: 0, success: false, error: error.message || "Error obteniendo entradas" };
  }
};