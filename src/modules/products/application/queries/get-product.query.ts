import { Product } from "../../domain/entities/product";
import { ProductRepository } from "../ports/product.repository";
import { ID } from "../../../../shared/types";

export type GetProductQuery = {
  id: ID;
};

export type GetProductResult = {
  product: Product | null;
  success: boolean;
  error?: string;
};

export const getProduct = async (
  query: GetProductQuery,
  deps: { productRepo: ProductRepository }
): Promise<GetProductResult> => {
  try {
    const product = await deps.productRepo.findById(query.id);
    return { product, success: true };
  } catch (error: any) {
    return { product: null, success: false, error: error.message || "Error obteniendo producto" };
  }
};