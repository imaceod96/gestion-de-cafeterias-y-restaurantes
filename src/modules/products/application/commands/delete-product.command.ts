import { ProductRepository } from "../ports/product.repository";
import { ID } from "../../../../shared/types";

export type DeleteProductCommand = {
  id: ID;
};

export type DeleteProductResult = {
  success: boolean;
  error?: string;
};

export const deleteProduct = async (
  command: DeleteProductCommand,
  deps: { productRepo: ProductRepository }
): Promise<DeleteProductResult> => {
  try {
    const product = await deps.productRepo.findById(command.id);
    if (!product) {
      return { success: false, error: "Producto no encontrado" };
    }
    await deps.productRepo.delete(command.id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error eliminando producto" };
  }
};