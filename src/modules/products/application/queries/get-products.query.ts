import { Product } from "../../domain/entities/product";
import { ProductRepository } from "../ports/product.repository";

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
  query: GetProductsQuery = {},
  deps: { productRepo: ProductRepository }
): Promise<GetProductsResult> => {
  try {
    const { activeOnly = true } = query;
    const products = await deps.productRepo.findAll(activeOnly);
    return { products, total: products.length, success: true };
  } catch (error: any) {
    return { products: [], total: 0, success: false, error: error.message || "Error obteniendo productos" };
  }
};