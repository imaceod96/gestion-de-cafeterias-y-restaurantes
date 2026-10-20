import { Product } from "../../domain/entities/product";
import { ProductData } from "../../domain/entities/product";
import { EntityId } from "../../../shared/domain/value-objects";
import { ID } from "../../../shared/types";

export type GetProductsQuery = {
  activeOnly?: boolean;
};

export type GetProductsResult = {
  products: Product[];
  total: number;
  success: boolean;
  error?: string;
};

export const getProducts = async (
  query: GetProductsQuery = {}
): Promise<GetProductsResult> => {
  try {
    const { activeOnly = true } = query;
    // In a real implementation, this would query the database
    // For now, return empty array
    const products: Product[] = [];

    return {
      products,
      total: 0,
      success: true,
    };
  } catch (error: any) {
    return {
      products: [],
      total: 0,
      success: false,
      error: error.message || "Error getting products",
    };
  }
};