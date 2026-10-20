import { MerchandiseEntry } from "../../domain/entities/merchandise-entry";
import { EntityId } from "../../../shared/domain/value-objects";
import { ID } from "../../../shared/types";

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
  query: GetMerchandiseEntriesQuery = {}
): Promise<GetMerchandiseEntriesResult> => {
  try {
    const { productId } = query;
    // In a real implementation, this would query the database
    // For now, return empty array
    const entries: MerchandiseEntry[] = [];

    return {
      entries,
      total: 0,
      success: true,
    };
  } catch (error: any) {
    return {
      entries: [],
      total: 0,
      success: false,
      error: error.message || "Error getting merchandise entries",
    };
  }
};