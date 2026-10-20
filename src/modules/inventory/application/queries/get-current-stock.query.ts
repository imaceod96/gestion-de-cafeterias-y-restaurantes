import { InventoryMovement } from "../../domain/entities/inventory-movement";
import { EntityId } from "../../../shared/domain/value-objects";
import { ID } from "../../../shared/types";

export type GetCurrentStockQuery = {
  productId?: ID;
};

export type StockItem = {
  productId: ID;
  productName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
};

export type GetCurrentStockResult = {
  items: StockItem[];
  total: number;
  success: boolean;
  error?: string;
};

export const getCurrentStock = async (
  query: GetCurrentStockQuery = {}
): Promise<GetCurrentStockResult> => {
  try {
    const { productId } = query;
    // In a real implementation, this would aggregate movements from the database
    // For now, return empty array
    const items: StockItem[] = [];

    return {
      items,
      total: 0,
      success: true,
    };
  } catch (error: any) {
    return {
      items: [],
      total: 0,
      success: false,
      error: error.message || "Error getting current stock",
    };
  }
};